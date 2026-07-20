import mongoose from 'mongoose';

const healthTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a health tip title'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt/description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const HealthTip = mongoose.model('HealthTip', healthTipSchema);

export default HealthTip;
