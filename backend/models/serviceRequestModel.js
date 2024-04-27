const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceRequestSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  type: { type: String, required: true }, //New Connection Request, billing inquiries,meter issues, leak checks,
  description: { type: String, required: true },
  status: { type: String, required: true, default: "Pending" }, //  Pending, In Progress, Resolved, Cancelled
  files: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
