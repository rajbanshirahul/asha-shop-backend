const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { isValidObjectId } = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// @desc      Get all Products
// @access    Public
router.get(
  `/`,
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.query.categories) {
      let categoryIds = req.query.categories.split(',');
      const isAllIdsValid = categoryIds.every((x) => isValidObjectId(x));

      if (!isAllIdsValid)
        return res
          .status(400)
          .json({ success: false, message: 'Invalid category parameters' });

      filter = { category: categoryIds };
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
      res.status(404).json({ success: false, message: 'Products not found' });
    }
    res.status(200).json({ success: true, data: productList });
  })
);

// @desc      Get single Products
// @access    Public
router.get(
  `/:id`,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      res.status(400).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  })
);

// @desc      Create a Product
// @access    Private
router.post(
  `/`,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category' });

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: product });
  })
);

// @desc      Update a Product
// @access    Private
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid product category' });

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product)
      return res
        .status(400)
        .json({ success: false, message: 'Product update failed' });

    res.status(200).json({ success: true, data: product });
  })
);

// @desc      Delete a Product
// @access    Private
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  })
);

// @desc      GET Product count
// @access    Public
router.get(
  `/get/count`,
  asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Request' });
    }

    res
      .status(200)
      .json({ success: true, data: { productCount: productCount } });
  })
);

// @desc      GET featured Products
// @access    Public
router.get(
  `/get/featured/:count`,
  asyncHandler(async (req, res) => {
    const count = req.params.count ? req.params.count : 0;

    const productsFeatured = await Product.find({ isFeatured: true }).limit(
      +count
    );

    if (!productsFeatured) {
      return res
        .status(404)
        .json({ success: false, message: 'Featured Products not found' });
    }

    res.status(200).json({ success: true, data: productsFeatured });
  })
);

module.exports = router;
