
const mongoose = require("mongoose");

const eligibleStudentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },

  registerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  department: {
    type: String,
    trim: true
  },

  isRegistered: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model(
  "EligibleStudent",
  eligibleStudentSchema,
  "eligible_students"
);