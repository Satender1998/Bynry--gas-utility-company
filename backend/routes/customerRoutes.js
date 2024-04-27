const express = require("express");
const router = express.Router();
const {
  getCustomerProfile,
  updateCustomerProfile,
} = require("../controllers/customerController");
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/:customerId").get(isAuthenticatedUser,  getCustomerProfile)
router.route("/:customerId").put(isAuthenticatedUser, updateCustomerProfile)


module.exports = router;
