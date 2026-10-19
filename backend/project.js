const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    domain: { type: String, default: "" },
    technologies: { type: [String], required: true },
    problemStatement: { type: String, required: true },
    mainFeatures: { type: [String], required: true },

    projectType: {
      type: String,
      enum: ["existing", "student"],
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);