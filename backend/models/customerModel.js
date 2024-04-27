const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please Enter Your First Name"],
  },
  lastName: {
    type: String,
    required: [true, "Please Enter Your Last Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  role: {
    type: String,
    default: "user",
  },
  registeredAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Password hashing middleware
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// JWT token generation
customerSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Password comparison
customerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Password reset token generation
customerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
  return resetToken;
};

module.exports = mongoose.model("Customer", customerSchema);
