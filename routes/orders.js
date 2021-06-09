const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');

// @desc      Get all Orders
// @access    Private
router.get(
  `/`,
  asyncHandler(async (req, res) => {
    const orderList = await Order.find()
      .populate('user', 'name')
      .sort({ dateOrdered: -1 });

    if (!orderList) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    res.status(200).json({ success: true, data: orderList });
  })
);

// @desc      Get Order
// @access    Private
router.get(
  `/:id`,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      });

    if (!order) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    res.status(200).json({ success: true, data: order });
  })
);

// @desc      Create Order
// @access    Private
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = await OrderItem.create(orderItem);
        return newOrderItem._id;
      })
    );

    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          'product',
          'price'
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = await Order.create({
      ...req.body,
      orderItems: orderItemsIds,
      totalPrice: totalPrice,
    });

    if (!order)
      return res
        .status(400)
        .json({ success: false, message: 'The order cannot be created' });

    res.status(201).json({ success: true, data: order });
  })
);

// @desc      Update order
// @access    Private
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order)
      return res
        .status(400)
        .json({ success: false, message: 'Order update failed' });

    res.status(200).json({ success: true, data: order });
  })
);

// @desc      Delete Order
// @access    Private
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndRemove(req.params.id);
    if (order) {
      await order.orderItems.map(async (orderItem) => {
        await OrderItem.findByIdAndRemove(orderItem);
      });
      return res.status(200).json({ success: true, message: 'Order deleted' });
    }

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
  })
);

// @desc    Get Total Sales
// @access  Private
router.get(
  '/get/totalSales',
  asyncHandler(async (req, res) => {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);

    if (!totalSales) {
      return res.status(400).json({
        success: false,
        message: 'The order sales cannot be generated',
      });
    }

    res.status(200).json({
      success: true,
      data: { totalSales: totalSales.pop().totalSales },
    });
  })
);

// @desc      GET Order count
// @access    Public
router.get(
  `/get/count`,
  asyncHandler(async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count);

    if (!orderCount) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Request' });
    }

    res.status(200).json({ success: true, data: { orderCount: orderCount } });
  })
);

// @desc      Get all Orders of a particular user
// @access    Private
router.get(
  `/get/userorders/:userid`,
  asyncHandler(async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })
      .sort({ dateOrdered: -1 });

    if (!userOrderList) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    res.status(200).json({ success: true, data: userOrderList });
  })
);

module.exports = router;
