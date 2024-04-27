const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { registerCustomer, loginCustomer, logout } = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(registerCustomer);
router.route("/login").post(loginCustomer)
router.route("/logout").get(logout);

module.exports = router