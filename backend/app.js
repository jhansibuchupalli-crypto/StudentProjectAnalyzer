require("dotenv").config();
const express = require("express");
const Project = require("./project");
const cors = require("cors");
const mongoose=require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Project Analyzer Backend is Running!");
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
const Student = require("./student");
const Faculty = require("./faculty");

app.post("/api/register", async (req, res) => {
  try {
    const { name, registerNumber, password } = req.body;

    const student = new Student({
      name,
      registerNumber,
      password
    });

    await student.save();

    res.status(201).json({
      message: "Student registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});
console.log("PROJECT ROUTE LOADED");
app.post("/api/projects", async (req, res) => {
  console.log("PROJECT SUBMIT REQUEST RECEIVED");
  try {
   const {
  title,
  abstract,
  domain,
  technologies,
  problemStatement,
  mainFeatures,
  registerNumber
} = req.body;

  const project = new Project({
  title,
  abstract,
  domain,
  technologies,
  problemStatement,
  mainFeatures,
  projectType: "student",
  studentRegisterNumber: registerNumber,
  status: "Pending"
});

    const savedProject = await project.save();
    console.log("SAVED PROJECT:", savedProject);

    res.status(201).json({
      message: "Project submitted successfully!",
      project: savedProject
    });
  } catch (error) {
    res.status(500).json({
      message: "Project submission failed",
      error: error.message
    });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const { registerNumber } = req.query;

    let projects;

    if (registerNumber) {
      projects = await Project.find({
        projectType: "student",
        studentRegisterNumber: registerNumber
      });
    } else {
      projects = await Project.find({
        projectType: "student"
      });
    }

    const projectsWithStudentName = await Promise.all(
      projects.map(async (project) => {
        const student = await Student.findOne({
          registerNumber: project.studentRegisterNumber
        });

        console.log("Project Register:", project.studentRegisterNumber);
        console.log("Student Found:", student);

        return {
          ...project.toObject(),
          studentName: student ? student.name : "Unknown Student"
        };
      })
    );

    res.json(projectsWithStudentName);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message
    });
  }
});


app.post("/api/faculty", async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    const faculty = new Faculty({
      facultyId,
      password
    });

    await faculty.save();

    res.status(201).json({
      message: "Faculty account created successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Faculty account creation failed",
      error: error.message
    });
  }
});
app.post("/api/faculty/login", async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    const faculty = await Faculty.findOne({
      facultyId,
      password
    });

    if (!faculty) {
      return res.status(401).json({
        message: "Invalid faculty ID or password"
      });
    }

    res.json({
      message: "Faculty login successful",
      faculty: {
        facultyId: faculty.facultyId
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Faculty login failed",
      error: error.message
    });
  }
});
app.get("/api/create-faculty", async (req, res) => {
  try {
    const faculty = new Faculty({
      facultyId: "F001",
      password: "1234"
    });

    await faculty.save();

    res.send("Faculty F001 created successfully");
  } catch (error) {
    res.send("Faculty creation failed: " + error.message);
  }
});
const PORT = 5000;
app.post("/api/login", async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    const student = await Student.findOne({
      registerNumber,
      password
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid register number or password"
      });
    }

    res.json({
      message: "Login successful",
      student: {
        name: student.name,
        registerNumber: student.registerNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});
app.get("/api/test", (req, res) => {
  res.send("API TEST WORKING");
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      message: "Admin login successful"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid admin username or password"
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});