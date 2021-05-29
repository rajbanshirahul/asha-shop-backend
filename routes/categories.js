const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// @desc      Get all Categories
// @access    Private
router.get(
  `/`,
  asyncHandler(async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res
        .status(400)
        .json({ success: false, message: 'No any categories found' });
    }
    res.status(200).json({ success: true, data: categoryList });
  })
);

// @desc      Get single Category
// @access    Private
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'The category with the given ID was not found',
      });
    }
    res.status(200).json({ success: true, data: category });
  })
);

// @desc      Create Category
// @access    Private
router.post(
  '/',
  asyncHandler(async (req, res) => {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });

    category = await category.save();

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'The category cannot be created' });

    res.status(201).json({ success: true, data: category });
  })
);

// @desc      Update Category
// @access    Private
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon || category.icon,
        color: req.body.color,
      },
      { new: true }
    );

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Category update failed' });

    res.status(200).json({ success: true, data: category });
  })
);

// @desc      Delete Category
// @access    Private
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  })
);

module.exports = router;
