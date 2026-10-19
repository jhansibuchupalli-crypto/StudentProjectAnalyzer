
const mongoose = require("mongoose");
const Project = require("./project");

const sampleProjects = [
  {
    title: "Online Attendance System",
    abstract: "A system to record and manage student attendance digitally.",
    domain:"Education Technology.",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Manual attendance takes time and can cause errors.",
    mainFeatures: [
      "Student attendance recording",
      "Attendance reports",
      "Student records management"
    ]
  },
  {
    title: "College Bus Tracking System",
    abstract: "A system that helps students track college buses.",
    domain:"Transportation & GPS Tracking.",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Students do not know the real-time location of college buses.",
    mainFeatures: [
      "Bus location tracking",
      "Bus route details",
      "Arrival time information"
    ]
  },
  {
    title: "Student Placement Portal",
    abstract: "A portal to manage student placement activities.",
    domain:"Recruitment & career Management.",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Managing student placement information manually is difficult.",
    mainFeatures: [
      "Student profile management",
      "Job notifications",
      "Placement records"
    ]
  },
  {
    title: "Library Management System",
    abstract: "A system to manage books and library transactions.",
    domain:"Library Management & Information Systems.",
    technologies: ["HTML", "JavaScript", "MongoDB"],
    projectType: "existing",
    problemStatement: "Manual library records are difficult to maintain.",
    mainFeatures: [
      "Book search",
      "Book issue and return",
      "Book availability tracking"
    ]
  },
  {
    title: "Online Exam System",
    abstract: "A platform for conducting online examinations.",
    domain:"E-Learning & Online Assessment.",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Conducting and evaluating exams manually takes time.",
    mainFeatures: [
      "Online tests",
      "Automatic result calculation",
      "Student result reports"
    ]
  }
];

async function seedProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/student_project_analyzer");

    for (const projectData of sampleProjects) {
      const existingProject = await Project.findOne({
        title: projectData.title
      });

     if (existingProject) {
  existingProject.status = "Approved";
  existingProject.projectType = "existing";
  await existingProject.save();

        console.log("Already exists; status set to Approved:", projectData.title);
      } else {
        // New reference project
        await Project.create({
          ...projectData,
          status: "Approved"
        });

        console.log("New Approved project added:", projectData.title);
      }
    }

    console.log("Reference projects processed successfully!");
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

require("dotenv").config();
seedProjects();
