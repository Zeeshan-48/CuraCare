import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

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
      // Send registration OTP email
      const emailOptions = {
        email: user.email,
        subject: 'CuraCare Account Verification Code',
        message: `Welcome to CuraCare! Your verification code is ${verificationOTP}. It expires in 10 minutes.`,
        html: `
          <h3>Welcome to CuraCare!</h3>
          <p>Thank you for registering. Please use the verification code below to activate your account:</p>
          <h2 style="color: #0d9488; font-size: 28px; letter-spacing: 4px;">${verificationOTP}</h2>
          <p>This code will expire in 10 minutes.</p>
        `,
      };

      const emailSent = await sendEmail(emailOptions);
      if (!emailSent) {
        console.log(`[DEV MODE] Verification OTP for ${user.email} is: ${verificationOTP}`);
      }

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
        },
        token: generateToken(user._id),
        otp: process.env.NODE_ENV === 'development' ? verificationOTP : undefined,
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

    // Send email
    const emailOptions = {
      email: user.email,
      subject: 'CuraCare Password Reset Code',
      message: `You requested a password reset. Your OTP verification code is ${resetOTP}. It expires in 15 minutes.`,
      html: `
        <h3>CuraCare Password Reset</h3>
        <p>Please use the code below to reset your password:</p>
        <h2 style="color: #0d9488; font-size: 28px; letter-spacing: 4px;">${resetOTP}</h2>
        <p>This code will expire in 15 minutes.</p>
      `,
    };

    const emailSent = await sendEmail(emailOptions);
    if (!emailSent) {
      console.log(`[DEV MODE] Password Reset OTP for ${user.email} is: ${resetOTP}`);
    }

    res.json({
      success: true,
      message: 'OTP verification code sent to your email.',
      otp: process.env.NODE_ENV === 'development' ? resetOTP : undefined,
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

    // Send email
    const emailOptions = {
      email: user.email,
      subject: 'CuraCare Account Verification Code',
      message: `Your new verification code is ${verificationOTP}. It expires in 10 minutes.`,
      html: `
        <h3>CuraCare Account Verification</h3>
        <p>A new verification code was requested. Please use this code to activate your account:</p>
        <h2 style="color: #0d9488; font-size: 28px; letter-spacing: 4px;">${verificationOTP}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    const emailSent = await sendEmail(emailOptions);
    if (!emailSent) {
      console.log(`[DEV MODE] Resent Verification OTP for ${user.email} is: ${verificationOTP}`);
    }

    res.json({
      success: true,
      message: 'A new verification OTP code has been sent to your email.',
      otp: process.env.NODE_ENV === 'development' ? verificationOTP : undefined,
    });
  } catch (error) {
    next(error);
  }
};
