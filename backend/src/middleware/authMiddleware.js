import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Read token from Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Read token from cookies (if using cookie-parser)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB and attach to req (exclude password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      return next(new Error('User not found / Deleted user account'));
    }

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

// Role-based Access Control
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('You do not have permission to perform this action'));
    }
    next();
  };
};
