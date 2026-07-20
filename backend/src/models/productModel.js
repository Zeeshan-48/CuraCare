import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    genericName: {
      type: String,
      required: [true, 'Please provide the generic (scientific) name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide the brand or manufacturer'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify the category'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    uses: {
      type: String,
      required: [true, 'Please provide the uses of the medicine'],
    },
    sideEffects: {
      type: String,
      required: [true, 'Please list the side effects'],
    },
    dosage: {
      type: String,
      required: [true, 'Please provide the recommended dosage details'],
    },
    stock: {
      type: Number,
      required: [true, 'Please specify the stock count'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
