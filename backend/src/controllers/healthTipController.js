import HealthTip from '../models/healthTipModel.js';

// @desc    Get all health tips
// @route   GET /api/health-tips
// @access  Public
export const getHealthTips = async (req, res, next) => {
  try {
    const healthTips = await HealthTip.find({});
    res.json(healthTips);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new health tip
// @route   POST /api/health-tips
// @access  Private/Admin
export const createHealthTip = async (req, res, next) => {
  const { title, excerpt, category, image } = req.body;

  try {
    const healthTip = await HealthTip.create({
      title,
      excerpt,
      category,
      image,
    });
    res.status(201).json(healthTip);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a health tip
// @route   DELETE /api/health-tips/:id
// @access  Private/Admin
export const deleteHealthTip = async (req, res, next) => {
  const { id } = req.params;

  try {
    const healthTip = await HealthTip.findById(id);
    if (!healthTip) {
      res.status(404);
      return next(new Error('Health tip not found'));
    }

    await healthTip.deleteOne();
    res.json({ success: true, message: 'Health tip deleted successfully' });
  } catch (error) {
    next(error);
  }
};
