const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc      Get all Users
// @access    Private
router.get(
  `/`,
  asyncHandler(async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid request' });
    }
    res.status(200).json({ success: true, data: userList });
  })
);

// @desc      Get single User
// @access    Private
router.get(
  `/:id`,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  })
);

// @desc      Create a User
// @access    Public
router.post(
  `/register`,
  asyncHandler(async (req, res) => {
    if (!isValidEmail(req.body.email))
      return res
        .status(400)
        .json({ success: false, message: 'Valid email required' });

    const userWithEmailRegisteredExists = await User.findOne({
      email: req.body.email,
    });

    if (userWithEmailRegisteredExists)
      return res
        .status(400)
        .json({ success: false, message: 'Email already in use' });

    let user = await User.create({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'User cannot be created!' });
    user = await User.findById(user.id).select('-passwordHash');
    res.status(201).json({ success: true, data: user });
  })
);

// @desc      Update a User
// @access    Private
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isValidEmail(req.body.email))
      return res
        .status(400)
        .json({ success: false, message: 'Valid email required' });

    const userExisting = await User.findById(req.params.id);

    if (!userExisting)
      return res
        .status(404)
        .json({ success: false, message: 'User does not exist' });

    let passwordHash = userExisting.passwordHash;
    if (req.body.password)
      passwordHash = bcrypt.hashSync(req.body.password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        passwordHash: passwordHash,
      },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ success: true, data: user });
  })
);

// @desc      Login User
// @access    Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.JWT_SECRET;
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'Invalid credentials' });

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        {
          expiresIn: '1w',
        }
      );
      res.status(200).json({ success: true, data: { token: token } });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
  })
);

// @desc      Delete a User
// @access    Private
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  })
);

// @desc      GET user count
// @access    Private
router.get(
  `/get/count`,
  asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Request' });
    }

    res.status(200).json({ success: true, data: { userCount: userCount } });
  })
);

const isValidEmail = (email) => {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};

module.exports = router;
