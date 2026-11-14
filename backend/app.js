

require("dotenv").config();

const express = require("express");
const Project = require("./project");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const { otpRouter, consumeVerifiedEmail } = require("./otp");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use("/api/otp", otpRouter);

app.get("/", (req, res) => {
  res.send("Student Project Analyzer Backend is Running!");
});

// MONGODB CONNECTION
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
const EligibleStudent = require("./eligibleStudent");

// STUDENT REGISTRATION
app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      registerNumber,
      email,
      password,
      confirmPassword
    } = req.body;

    // Required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof registerNumber !== "string" ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "All registration fields are required."
      });
    }

    // U23 batch and allowed branches
    const registerNumberRegex =
      /^U23(CS|AI|ID|IB|DS|ML)(\d{4,})$/;

    const match = registerNumberRegex.exec(registerNumber);

    if (!match || !/[1-9]/.test(match[2])) {
      return res.status(400).json({
        message:
          "Invalid Register Number! Only U23 batch students from CS, AI, ID, IB, DS, ML branches are allowed."
      });
    }

    // Email validation
    const emailAddress = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }
   // Verify student details against Admin uploaded records
const normalizedRegisterNumber = registerNumber.trim();

const eligible = await EligibleStudent.findOne({
  registerNumber: normalizedRegisterNumber
});

if (
  !eligible ||
  typeof eligible.studentName !== "string" ||
  typeof eligible.email !== "string" ||
  eligible.studentName.trim().toLowerCase() !==
    name.trim().toLowerCase() ||
  eligible.email.trim().toLowerCase() !== emailAddress ||
  eligible.isRegistered
) {
  return res.status(403).json({
    message: "Student details could not be verified."
  });
}
    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,64}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-64 characters and contain uppercase, lowercase, number and special character."
      });
    }

    // Confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    // Duplicate register number
    const existingStudent = await Student.findOne({
      registerNumber
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "This Register Number is already registered!"
      });
    }

    // Duplicate email
    const existingEmail = await Student.findOne({
      email: emailAddress
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "This Email Address is already registered!"
      });
    }
// Allow registration only after email OTP verification
if (!consumeVerifiedEmail(emailAddress)) {
  return res.status(403).json({
    message: "Please verify your email using OTP before registering."
  });
}
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const student = new Student({
      name: name.trim(),
      registerNumber,
      email: emailAddress,
      emailVerified: true,
      password: hashedPassword
    });

    await student.save();
    eligible.isRegistered = true;
await eligible.save();

    res.status(201).json({
      message:
        "Student registered successfully. Email verification is pending."
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Register Number or Email already exists."
      });
    }

    res.status(500).json({
      message: "Registration failed."
    });
  }
});

console.log("PROJECT ROUTE LOADED");

// PROJECT SUBMISSION
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
    const student = await Student.findOne({
  registerNumber: savedProject.studentRegisterNumber
});

io.emit("newProjectSubmitted", {
  project: {
    ...savedProject.toObject(),
    studentName: student ? student.name : "Unknown Student"
  }
});
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

// GET STUDENT PROJECTS
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

        console.log(
          "Project Register:",
          project.studentRegisterNumber
        );
        console.log("Student Found:", student);

        return {
          ...project.toObject(),
          studentName: student
            ? student.name
            : "Unknown Student"
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

// FACULTY APPROVE / REJECT
app.patch("/api/projects/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        projectType: "student",
        status: "Pending"
      },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Pending project not found or already reviewed"
      });
    }
   const student = await Student.findOne({
  registerNumber: project.studentRegisterNumber
});

io.emit("projectStatusUpdated", {
  project: {
    ...project.toObject(),
    studentName: student ? student.name : "Unknown Student"
  }
});
    res.json({
      success: true,
      message: `Project ${status} successfully`,
      project
    });

  } catch (error) {
    console.error("Status update error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update project status"
    });
  }
});

// FACULTY ACCOUNT CREATION
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

// FACULTY LOGIN
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

// CREATE TEST FACULTY
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

// STUDENT LOGIN WITH BCRYPT
app.post("/api/login", async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    if (
      typeof registerNumber !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Register Number and Password are required."
      });
    }

    const student = await Student.findOne({
      registerNumber
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid register number or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid register number or password."
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
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed."
    });
  }
});

// TEST ROUTES
app.get("/api/test", (req, res) => {
  res.send("API TEST WORKING");
});

app.get("/api/similarity-test", (req, res) => {
  res.send("SIMILARITY TEST WORKING");
});

// SIMILARITY ANALYSIS
app.post("/api/similarity-analysis", async (req, res) => {
  try {
    const {
      projectId,
      title,
      abstract,
      domain,
      technologies,
      problemStatement,
      mainFeatures
    } = req.body;

    const query = {
      status: "Approved"
    };

    if (projectId) {
      query._id = { $ne: projectId };
    }

    const existingProjects = await Project.find(query);

    console.log(
      "Approved student projects found:",
      existingProjects.length
    );
    console.log(
      "Projects sent to AI:",
      existingProjects.length
    );

    const response = await axios.post(
      "http://127.0.0.1:5001/analyze",
      {
        project: {
          title,
          abstract,
          domain,
          technologies,
          problemStatement,
          mainFeatures
        },
        existingProjects: existingProjects.map((p) => ({
          title: p.title,
          abstract: p.abstract,
          domain: p.domain,
          problemStatement: p.problemStatement,
          technologies: p.technologies ?? [],
          mainFeatures: p.mainFeatures ?? []
        }))
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error(
      "Similarity analysis error:",
      error.response?.data || error.message
    );
    console.error(error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ADMIN LOGIN
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

// ADMIN DASHBOARD STATS
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalStudents =
      await Student.countDocuments();

    const totalProjects =
      await Project.countDocuments({
        projectType: "student"
      });

    res.json({
      totalStudents,
      totalProjects
    });

  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics"
    });
  }
});

// START BACKEND
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});