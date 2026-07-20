import Banner from '../models/bannerModel.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
  const { title, subtitle, image, link, isActive } = req.body;

  try {
    const banner = await Banner.create({
      title,
      subtitle,
      image,
      link,
      isActive,
    });
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      res.status(404);
      return next(new Error('Banner not found'));
    }

    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
