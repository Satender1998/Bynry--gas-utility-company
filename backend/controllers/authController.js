const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Customer = require("../models/customerModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.registerCustomer = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  const customer = new Customer({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
  });
  await customer.save();
  console.log("data saved");
  res.status(201).send("Customer registered");
});

exports.loginCustomer = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both
  console.log(email, password);
  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }
  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  console.log("hey");

  const isPasswordMatched = await customer.comparePassword(password);
  console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(customer, 200, res);
  console.log("customer logedin");
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
