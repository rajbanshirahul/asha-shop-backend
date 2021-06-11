const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { isValidObjectId } = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = renameFile(file, FILE_TYPE_MAP);
    cb(null, fileName);
  },
});

const uploadOptions = multer({ storage: storage });

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
  uploadOptions.single('image'),
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category' });

    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: 'No image in the request' });

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    const product = await Product.create({
      ...req.body,
      image: `${basePath}${fileName}`,
    });

    res.status(201).json({ success: true, data: product });
  })
);

// @desc      Update a Product
// @access    Private
router.put(
  '/:id',
  uploadOptions.single('image'),
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Product Id' });
    }
    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Category' });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Product!' });

    const file = req.file;
    let imagepath;

    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    } else {
      imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );

    if (!updatedProduct)
      return res
        .status(500)
        .json({ success: false, message: 'the product cannot be updated!' });

    res.status(200).json({ success: true, data: updatedProduct });
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

// @desc      Upload multiple images
// @access    Private
router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Product Id' });
    }

    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );

    if (!product)
      return res
        .status(500)
        .json({ success: false, message: 'The product cannot be updated!' });

    res.status(200).json({ success: true, data: product });
  })
);

// Returns name of a file with its extension
const renameFile = (file, FILE_TYPE_MAP) => {
  const fileNameSplits = file.originalname.split('.');
  fileNameSplits.pop(); // Removing extension
  const nameWithoutExtension = fileNameSplits.join();
  const fileName = nameWithoutExtension.split(' ').join('-'); // for if file has spaces in name
  const extension = FILE_TYPE_MAP[file.mimetype];

  return `${fileName}-${Date.now()}.${extension}`;
};

module.exports = router;
