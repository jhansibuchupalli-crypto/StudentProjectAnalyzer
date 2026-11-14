const mongoose = require("mongoose");
const EligibleStudent = require("./eligibleStudent");

const students = [
  {
    studentName: "Jhansi Lakshmi",
    registerNumber: "U23CS0133",
    email: "jhansibuchupalli@gmail.com",
    department: "CSE",
  },
  {
    studentName: "Srija",
    registerNumber: "U23CS0079",
    email: "srijapatel2306@gmail.com",
    department: "CSE",
  },
   {
    studentName: "Sanjana",
    registerNumber: "U23AI0016",
    email: "sanjanagayatri2740@gmail.com",
    department: "CSE",
  },
    {
    studentName: "Tharun",
    registerNumber: "U23CS0121",
    email: "bommireddytharunreddy@gmail.com",
    department: "CSE",
  },
];

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const student of students) {
      await EligibleStudent.updateOne(
        { registerNumber: student.registerNumber },
        {
          $setOnInsert: student,
        },
        { upsert: true }
      );
    }

    console.log("Eligible students saved successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

require("dotenv").config();
seedStudents();