import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a reviewer name'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please provide a reviewer role'],
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Please provide testimonial text'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
