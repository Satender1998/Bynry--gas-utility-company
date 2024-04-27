const express = require("express");
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequestById,
  getAllServiceRequestsForCustomer,
  updateServiceRequest,
  deleteServiceRequest,
} = require("../controllers/serviceRequestController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const {
  trackServiceRequestStatus,
  listAllServiceRequests,
  updateServiceRequestByAdmin,
  addNotesToServiceRequest,
} = require('../controllers/serviceRequestController');


router.route("/createService").post(isAuthenticatedUser, createServiceRequest)
router.route("/getServiceRequest").get(isAuthenticatedUser, getServiceRequestById)
router.route("/").get(isAuthenticatedUser, getAllServiceRequestsForCustomer)
router.route("/updateService/:requestId").put(isAuthenticatedUser, updateServiceRequest)
router.route("/deleteService/:requestId").delete(isAuthenticatedUser, deleteServiceRequest)

// Request Tracking
router.route("/status/:requestId").get(isAuthenticatedUser, trackServiceRequestStatus)

// Admin Endpoints
router.route("/admin/service-requests").get(isAuthenticatedUser,authorizeRoles("admin"), listAllServiceRequests)
router.route("/admin/service-requests/:requestId").put(isAuthenticatedUser,authorizeRoles("admin"), updateServiceRequestByAdmin)

router.post('/admin/notes/:requestId', addNotesToServiceRequest);

module.exports = router;
