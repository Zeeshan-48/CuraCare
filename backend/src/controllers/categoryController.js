import Category from '../models/categoryModel.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  const { name, description, image } = req.body;

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      return next(new Error('Category already exists'));
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  try {
    const category = await Category.findById(id);

    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }

    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
