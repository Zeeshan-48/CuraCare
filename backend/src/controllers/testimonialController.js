import Testimonial from '../models/testimonialModel.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({});
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res, next) => {
  const { name, role, text, rating, avatar } = req.body;

  try {
    const testimonial = await Testimonial.create({
      name,
      role,
      text,
      rating,
      avatar,
    });
    res.status(201).json(testimonial);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res, next) => {
  const { id } = req.params;

  try {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      res.status(404);
      return next(new Error('Testimonial not found'));
    }

    await testimonial.deleteOne();
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
};
