const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

// @desc      Get all Categories
router.get(`/`, async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res
        .status(400)
        .json({ success: false, message: 'No any categories found' });
    }
    res.status(200).json({ success: true, data: categoryList });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      Get single Category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'The category with the given ID was not found',
      });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      Create Category
router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  try {
    category = await category.save();

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'The category cannot be created' });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      Update Category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Category update failed' });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      Delete Category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

module.exports = router;
