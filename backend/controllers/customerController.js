const Customer = require("../models/customerModel");
const catchAsyncErrors = require("../middleware/catchAsyncError");

exports.getCustomerProfile = catchAsyncErrors(async (req, res) => {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).send("Customer not found");
    }
    res.status(200).json(customer);
});

exports.updateCustomerProfile = catchAsyncErrors(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, address } = req.body;
  const customer = await Customer.findByIdAndUpdate(
    req.params.customerId,
    {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
    },
    { new: true }
  );

  if (!customer) {
    return res.status(404).send("Customer not found");
  }
  res.status(200).json(customer);
});
