const { Order } = require('../models/order');
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// @desc      Get all Orders
// @access    Private
router.get(
  `/`,
  asyncHandler(async (req, res) => {
    const orderList = await Order.find();

    if (!orderList) {
      res.status(500).json({ success: false });
    }
    res.send(orderList);
  })
);

module.exports = router;
