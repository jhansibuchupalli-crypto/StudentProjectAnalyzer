const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

 
registerNumber: {
  type: String,
  required: true,
  unique: true,
  validate: {
    validator: function(value) {
      const regex = /^U(\d{2})CS0(?!000)\d{3}$/;
      const match = regex.exec(value);

      if (!match) {
        return false;
      }

      const batchYear = Number(match[1]);

      return batchYear >= 23;
    },
    message: "Invalid Register Number! Use U23CS0001 to U23CS0999 or a future batch."
  }
}
,



  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Student", studentSchema);