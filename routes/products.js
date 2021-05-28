const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { isValidObjectId } = require('mongoose');
const express = require('express');
const router = express.Router();

// @desc      Get all Products
router.get(`/`, async (req, res) => {
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

  try {
    const productList = await Product.find(filter).populate('category');

    if (!productList) {
      res.status(404).json({ success: false, message: 'Products not found' });
    }
    res.status(200).json({ success: true, data: productList });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

// @desc      Get single Products
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(400).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

// @desc      Create a Product
router.post(`/`, async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category' });

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

// @desc      Update a Product
router.put('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      Delete a Product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      GET Product count
router.get(`/get/count`, async (req, res) => {
  try {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Request' });
    }

    res
      .status(200)
      .json({ success: true, data: { productCount: productCount } });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// @desc      GET featured Products
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  try {
    const productsFeatured = await Product.find({ isFeatured: true }).limit(
      +count
    );

    if (!productsFeatured) {
      return res
        .status(404)
        .json({ success: false, message: 'Featured Products not found' });
    }

    res.status(200).json({ success: true, data: productsFeatured });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

module.exports = router;
