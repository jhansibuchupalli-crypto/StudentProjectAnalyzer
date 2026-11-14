
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  registerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        const regex = /^U23(CS|AI|ID|IB|DS|ML)(\d{4,})$/;
        const match = regex.exec(value);

        return match !== null && /[1-9]/.test(match[2]);
      },
      message:
        "Invalid Register Number! Only U23 batch students from CS, AI, ID, IB, DS, ML branches are allowed."
    }
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    validate: {
      validator: function (value) {
        if (!value) return true;

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Please enter a valid email address."
    }
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Student", studentSchema);
