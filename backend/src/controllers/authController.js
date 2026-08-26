import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { OAuth2Client } from 'google-auth-library';

let client;

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    // Generate verification OTP (6 digits)
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const user = await User.create({
      name,
      email,
      password,
      role: 'customer', // default role
      isVerified: false,
      verificationOTP,
      verificationOTPExpires,
    });

    if (user) {
      console.log(`Verification OTP for ${user.email} is: ${verificationOTP}`);

      // For development speed, register logs in directly and returns verified token if required,
      // but let's return the token and user profile immediately as frontend expects.
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          address: user.address || {},
        },
        token: generateToken(user._id),
        otp: verificationOTP,
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      if (!user.isVerified) {
        res.status(403);
        return next(new Error('Your account is not verified. Please verify your email first.'));
      }
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          address: user.address || {},
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for account verification
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.isVerified) {
      return res.json({ success: true, message: 'Account is already verified.' });
    }

    if (
      user.verificationOTP === otp &&
      user.verificationOTPExpires > Date.now()
    ) {
      user.isVerified = true;
      user.verificationOTP = undefined;
      user.verificationOTPExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Account verified successfully.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          address: user.address || {},
        },
      });
    } else {
      res.status(400);
      return next(new Error('Invalid or expired OTP code'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      return next(new Error('No account found with this email'));
    }

    // Generate reset password OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetOTP;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    console.log(`Password Reset OTP for ${user.email} is: ${resetOTP}`);

    res.json({
      success: true,
      message: 'OTP verification code generated.',
      otp: resetOTP,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired OTP code'));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Also mark verified if they reset password successfully
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationOTP = undefined;
      user.verificationOTPExpires = undefined;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        address: user.address || {},
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;

      if (req.body.address) {
        user.address = {
          street: req.body.address.street !== undefined ? req.body.address.street : user.address?.street,
          city: req.body.address.city !== undefined ? req.body.address.city : user.address?.city,
          state: req.body.address.state !== undefined ? req.body.address.state : user.address?.state,
          postalCode: req.body.address.postalCode !== undefined ? req.body.address.postalCode : user.address?.postalCode,
          country: req.body.address.country !== undefined ? req.body.address.country : user.address?.country,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        isVerified: updatedUser.isVerified,
        address: updatedUser.address || {},
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Resend account verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.isVerified) {
      res.status(400);
      return next(new Error('This account is already verified'));
    }

    // Generate new OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = verificationOTP;
    user.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`Resent Verification OTP for ${user.email} is: ${verificationOTP}`);

    res.json({
      success: true,
      message: 'A new verification OTP code has been generated.',
      otp: verificationOTP,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  const { token } = req.body;

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    
    if (!clientId) {
      throw new Error('Server misconfiguration: GOOGLE_CLIENT_ID is missing or undefined.');
    }

    // Verify token using Google's tokeninfo endpoint to bypass local Windows clock skew issues
    // (google-auth-library strictly fails if the local machine time is even slightly behind Google's)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = await googleRes.json();

    if (!googleRes.ok) {
      throw new Error(payload.error_description || 'Failed to verify token with Google');
    }

    if (payload.aud !== clientId) {
      throw new Error('Wrong recipient, payload audience != requiredAudience');
    }

    const { email, name, picture, email_verified } = payload;
    const isEmailVerified = email_verified === true || email_verified === 'true';

    if (!isEmailVerified) {
      res.status(400);
      return next(new Error('Google email is not verified'));
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register user if they don't exist
      // Generate a secure random password since it is a required field in Mongoose schema
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        profileImage: picture,
        isVerified: true, // Google emails are pre-verified
        role: 'customer',
      });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage || picture,
        isVerified: user.isVerified,
        address: user.address || {},
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401);
    next(new Error('Invalid Google token: ' + error.message));
  }
};
