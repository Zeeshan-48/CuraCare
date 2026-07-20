import Message from '../models/messageModel.js';

// @desc    Submit a new message/contact inquiry
// @route   POST /api/messages
// @access  Public
export const submitMessage = async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    return next(new Error('All fields (name, email, subject, message) are required'));
  }

  try {
    const newMessage = await Message.create({ name, email, subject, message });
    res.status(201).json({
      success: true,
      message: 'Message submitted successfully',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (for admin dashboard view)
// @route   GET /api/messages
// @access  Private/Admin
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
