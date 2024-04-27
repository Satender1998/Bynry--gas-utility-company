const catchAsyncErrors = require("../middleware/catchAsyncError");
const ServiceRequest = require("../models/serviceRequestModel");
const ErrorHandler = require("../middleware/error");
const cloudinary = require("cloudinary");


exports.createServiceRequest = catchAsyncErrors(async (req, res, next) => {
  // Corrected the function parameters syntax
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("User Avatar Required!", 400));
  }

  const { imageOfCus } = req.files; // Assuming 'imageOfCus' is the name of the file input field
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!imageOfCus || !allowedFormats.includes(imageOfCus.mimetype)) {
    // Added check for undefined 'imageOfCus'
    return next(
      new ErrorHandler(
        "Invalid file type. Please provide your avatar in png, jpg, or webp format.",
        400
      )
    );
  }

  const { customer, type, description } = req.body;

  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    imageOfCus.tempFilePath,
    {
      folder: "service_requests", // specify a folder in cloudinary
    }
  );

  // Check for cloudinary error explicitly
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary error:",
      cloudinaryResponse.error
        ? cloudinaryResponse.error.message
        : "Unknown cloudinary error!"
    );
    return next(new ErrorHandler("Failed to upload image to Cloudinary.", 500));
  }

  // files should store the cloudinary response info
  const newRequest = new ServiceRequest({
    customer,
    type,
    description,
    files: {
      // This should be structured according to your ServiceRequest model schema
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  await newRequest.save();
  res.status(201).json({
    message: "Service Request created successfully",
    data: newRequest,
  });
});

exports.getServiceRequestById = catchAsyncErrors(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.requestId).populate(
    "customer files"
  );
  if (!request) {
    return res.status(404).send("Service request not found");
  }
  res.json(request);
});

exports.getAllServiceRequestsForCustomer = catchAsyncErrors(
  async (req, res) => {
    // console.log("hey");
    const { status, fromDate, toDate } = req.query;
    // console.log(status);
    // console.log(fromDate);
    // console.log(toDate);
    const query = { customer: req.customerId }; // Assuming customer ID comes from authenticated session
    // console.log(query);
    if (status) query.status = status;
    if (fromDate && toDate) {
      query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
      console.log(
        (query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) })
      );
    }

    // const requests1 = await ServiceRequest.find().populate('customer')
    // console.log(requests1);

    try {
      console.log("Executing query:", query);
      const requests = await ServiceRequest.find(query);
      console.log("Found requests:", requests);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);





exports.updateServiceRequest = catchAsyncErrors(async (req, res, next) => {
  const { type, description, status } = req.body;
  const { requestId } = req.params;

  try {
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).send("Service request not found");
    }

    // Handle file upload if there is any file
    let filesUpdate = {};
    if (req.files && req.files.imageOfCus) {
      const imageOfCus = req.files.imageOfCus;
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedFormats.includes(imageOfCus.mimetype)) {
        return next(
          new ErrorHandler(
            "Invalid file type. Only png, jpg, and webp formats are allowed.",
            400
          )
        );
      }

      // Upload new image to Cloudinary
      const cloudinaryResponse = await cloudinary.v2.uploader.upload(
        imageOfCus.tempFilePath,
        {
          folder: "service_requests",
        }
      );

      // Prepare update data for files
      if (cloudinaryResponse) {
        filesUpdate = {
          files: {
            public_id: cloudinaryResponse.public_id, // Assuming you want to store the public_id and url
            url: cloudinaryResponse.secure_url,
          },
        };
      }
    }

    // Update the service request with new data
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      requestId,
      {
        type,
        description,
        status,
        ...filesUpdate,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("customer files");

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.deleteServiceRequest = catchAsyncErrors(async (req, res) => {
  try {
    const deletedRequest = await ServiceRequest.findByIdAndDelete(
      req.params.requestId
    );
    if (!deletedRequest) {
      return res.status(404).send("Service request not found");
    }
    res.status(204).send({message : "Data deleted successfully"}); // No content to send back
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// Track service request status
exports.trackServiceRequestStatus = catchAsyncErrors(async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(
      req.params.requestId,
      "status"
    );
    if (!serviceRequest) {
      return res.status(404).send("Service request not found");
    }
    res.json({ status: serviceRequest.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// Admin functionality
exports.listAllServiceRequests = catchAsyncErrors(async (req, res) => {
  try {
    // console.log("hey");
    const serviceRequests = await ServiceRequest.find({});
    res.json(serviceRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.updateServiceRequestByAdmin = catchAsyncErrors(async (req, res) => {
  try {
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).send("Service request not found");
    }
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.addNotesToServiceRequest = catchAsyncErrors(async (req, res) => {
  try {
    const { note } = req.body;
    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      { $push: { notes: note } }, 
      { new: true }
    );
    if (!serviceRequest) {
      return res.status(404).send("Service request not found");
    }
    res.json(serviceRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

