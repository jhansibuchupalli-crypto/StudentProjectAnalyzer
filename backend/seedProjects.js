
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
  },
  {
    title: "Online Exam System",
    abstract: "A platform for conducting online examinations.",
    domain: "E-Learning & Online Assessment",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Conducting and evaluating exams manually takes time.",
    mainFeatures: [
      "Online tests",
      "Automatic result calculation",
      "Student result reports"
    ]
  },
  {
    title: "Library Management System",
    abstract: "A web application to manage library books, student borrowing records, and book returns.",
    domain: "Library Management",
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    projectType: "existing",
    problemStatement: "Manual library records make book tracking and searching difficult.",
    mainFeatures: [
      "Book registration",
      "Book issue and return",
      "Search available books"
    ]
  },
  {
    title: "Hospital Management System",
    abstract: "A system for managing hospital patients, doctors, appointments, and medical records.",
    domain: "Healthcare",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Paper-based hospital management can cause delays and record errors.",
    mainFeatures: [
      "Patient registration",
      "Doctor appointment booking",
      "Medical record management"
    ]
  },
  {
    title: "Online Shopping System",
    abstract: "An e-commerce website where customers can browse products and place orders online.",
    domain: "E-Commerce",
    technologies: ["React", "Express.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Small businesses need an easy way to sell products online.",
    mainFeatures: [
      "Product catalog",
      "Shopping cart",
      "Order tracking"
    ]
  },
  {
    title: "Student Attendance Management System",
    abstract: "A web application for recording student attendance and calculating attendance percentages.",
    domain: "Education",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Manual attendance tracking is time-consuming and prone to mistakes.",
    mainFeatures: [
      "Daily attendance marking",
      "Attendance percentage calculation",
      "Attendance reports"
    ]
  },
  {
    title: "Online Food Ordering System",
    abstract: "A platform that allows customers to browse restaurant menus and order food online.",
    domain: "Food Technology",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Phone-based food ordering can result in incorrect orders and delays.",
    mainFeatures: [
      "Restaurant menu display",
      "Online food ordering",
      "Order status tracking"
    ]
  },
  {
    title: "Online Banking System",
    abstract: "A web application that provides basic banking services and transaction history.",
    domain: "FinTech",
    technologies: ["Java", "Spring Boot", "MySQL"],
    projectType: "existing",
    problemStatement: "Customers need convenient access to basic banking information and services.",
    mainFeatures: [
      "Account balance display",
      "Transaction history",
      "Fund transfer simulation"
    ]
  },
  {
    title: "College Event Management System",
    abstract: "A platform for publishing college events and managing student registrations.",
    domain: "Event Management",
    technologies: ["React", "Express.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Managing event registrations manually creates confusion and duplicate entries.",
    mainFeatures: [
      "Event creation",
      "Student registration",
      "Event schedule display"
    ]
  },
  {
    title: "Online Voting System",
    abstract: "A web-based system for conducting elections and counting votes electronically.",
    domain: "E-Governance",
    technologies: ["PHP", "MySQL", "JavaScript"],
    projectType: "existing",
    problemStatement: "Traditional voting processes can require significant time and manual counting.",
    mainFeatures: [
      "Voter registration",
      "Electronic vote submission",
      "Vote count display"
    ]
  },
  {
    title: "Job Portal System",
    abstract: "A platform connecting job seekers with employers through job listings and applications.",
    domain: "Employment Services",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Job seekers find it difficult to discover suitable vacancies from multiple sources.",
    mainFeatures: [
      "Job posting",
      "Job search and filtering",
      "Online job applications"
    ]
  },
  {
    title: "Online Learning Management System",
    abstract: "A digital learning platform for sharing study materials, lessons, and assignments.",
    domain: "E-Learning",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Students need a centralized platform to access learning materials and coursework.",
    mainFeatures: [
      "Course management",
      "Study material uploads",
      "Assignment submission"
    ]
  },
  {
    title: "Personal Expense Tracker",
    abstract: "An application that records daily expenses and summarizes spending by category.",
    domain: "Personal Finance",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "People often struggle to track spending and maintain a monthly budget.",
    mainFeatures: [
      "Expense recording",
      "Category-wise spending",
      "Monthly expense reports"
    ]
  },
  {
    title: "Vehicle Parking Management System",
    abstract: "A system that monitors parking spaces and manages vehicle entry and exit.",
    domain: "Smart Transportation",
    technologies: ["Python", "Flask", "MySQL"],
    projectType: "existing",
    problemStatement: "Drivers waste time searching for available parking spaces.",
    mainFeatures: [
      "Parking slot management",
      "Vehicle entry records",
      "Parking fee calculation"
    ]
  },
  {
    title: "Online Doctor Appointment System",
    abstract: "A healthcare platform that lets patients find doctors and schedule consultations.",
    domain: "Healthcare",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Booking doctor appointments through manual processes can cause long waiting times.",
    mainFeatures: [
      "Doctor search",
      "Appointment booking",
      "Appointment history"
    ]
  },
  {
    title: "Blood Bank Management System",
    abstract: "A system for maintaining blood donor details and monitoring blood stock availability.",
    domain: "Healthcare",
    technologies: ["PHP", "MySQL", "Bootstrap"],
    projectType: "existing",
    problemStatement: "Finding suitable blood donors quickly is difficult when donor records are outdated.",
    mainFeatures: [
      "Donor registration",
      "Blood group search",
      "Blood stock management"
    ]
  },
  {
    title: "Weather Forecast Application",
    abstract: "An application that displays weather conditions and forecasts for selected locations.",
    domain: "Weather Technology",
    technologies: ["React", "JavaScript", "Weather API"],
    projectType: "existing",
    problemStatement: "Users need accessible weather information to plan daily activities.",
    mainFeatures: [
      "Location-based weather",
      "Temperature display",
      "Weather forecast"
    ]
  },
  {
    title: "Real Estate Management System",
    abstract: "A website for listing properties and helping users search for houses and apartments.",
    domain: "Real Estate",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Searching property listings manually makes property comparison difficult.",
    mainFeatures: [
      "Property listings",
      "Price and location filters",
      "Property inquiry form"
    ]
  },
  {
    title: "Bus Reservation System",
    abstract: "An online platform for searching bus routes and reserving passenger seats.",
    domain: "Transportation",
    technologies: ["Java", "Spring Boot", "MySQL"],
    projectType: "existing",
    problemStatement: "Manual ticket booking makes seat availability and reservation management difficult.",
    mainFeatures: [
      "Bus route search",
      "Seat selection",
      "Ticket booking records"
    ]
  },
  {
    title: "Train Ticket Booking System",
    abstract: "A reservation application for searching train schedules and managing passenger bookings.",
    domain: "Transportation",
    technologies: ["Python", "Django", "PostgreSQL"],
    projectType: "existing",
    problemStatement: "Passengers need a convenient way to view train schedules and manage reservations.",
    mainFeatures: [
      "Train schedule search",
      "Passenger details",
      "Booking status display"
    ]
  },
  {
    title: "Smart Irrigation System",
    abstract: "A system that monitors soil moisture and controls irrigation according to crop water needs.",
    domain: "Agriculture Technology",
    technologies: ["Arduino", "C++", "Soil Moisture Sensor"],
    projectType: "existing",
    problemStatement: "Excessive manual watering wastes water and may harm crop growth.",
    mainFeatures: [
      "Soil moisture monitoring",
      "Automatic water pump control",
      "Water usage tracking"
    ]
  },
  {
    title: "Crop Disease Detection System",
    abstract: "An image-based application that identifies possible crop diseases from leaf photographs.",
    domain: "Agriculture & AI",
    technologies: ["Python", "TensorFlow", "OpenCV"],
    projectType: "existing",
    problemStatement: "Farmers may find it difficult to identify plant diseases at an early stage.",
    mainFeatures: [
      "Leaf image upload",
      "Disease classification",
      "Basic treatment suggestions"
    ]
  },
  {
    title: "Face Recognition Attendance System",
    abstract: "An attendance application that uses facial recognition to identify registered students.",
    domain: "Artificial Intelligence",
    technologies: ["Python", "OpenCV", "SQLite"],
    projectType: "existing",
    problemStatement: "Manual attendance marking consumes classroom time and can lead to proxy attendance.",
    mainFeatures: [
      "Face registration",
      "Face-based identification",
      "Attendance report generation"
    ]
  },
  {
    title: "Library Book Recommendation System",
    abstract: "A recommendation application that suggests books based on users' interests and reading history.",
    domain: "Recommendation Systems",
    technologies: ["Python", "Pandas", "Scikit-learn"],
    projectType: "existing",
    problemStatement: "Readers may struggle to discover books relevant to their interests.",
    mainFeatures: [
      "User preference collection",
      "Book recommendations",
      "Book category filtering"
    ]
  },
  {
    title: "Employee Payroll Management System",
    abstract: "A business application for managing employee information, salary calculations, and payslips.",
    domain: "Human Resources",
    technologies: ["Java", "MySQL", "JSP"],
    projectType: "existing",
    problemStatement: "Manual payroll calculations can cause salary errors and delays.",
    mainFeatures: [
      "Employee records",
      "Salary calculation",
      "Payslip generation"
    ]
  },
  {
    title: "Inventory Management System",
    abstract: "A software system for tracking stock levels, product purchases, and sales.",
    domain: "Business Management",
    technologies: ["Python", "Django", "MySQL"],
    projectType: "existing",
    problemStatement: "Poor stock tracking can lead to shortages and excess inventory.",
    mainFeatures: [
      "Product stock tracking",
      "Purchase and sales records",
      "Low-stock alerts"
    ]
  },
  {
    title: "Complaint Management System",
    abstract: "A portal where users can submit complaints and monitor their resolution status.",
    domain: "Public Service Management",
    technologies: ["React", "Express.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Complaints submitted through informal channels are difficult to track.",
    mainFeatures: [
      "Complaint submission",
      "Complaint status tracking",
      "Administrator response"
    ]
  },
  {
    title: "Online Hotel Booking System",
    abstract: "A website for searching hotels, checking room availability, and managing reservations.",
    domain: "Travel & Hospitality",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Travelers need an easy way to compare hotel options and manage room reservations.",
    mainFeatures: [
      "Hotel search",
      "Room availability display",
      "Reservation management"
    ]
  },
  {
    title: "Courier Tracking System",
    abstract: "A platform for recording parcel shipments and tracking delivery progress.",
    domain: "Logistics",
    technologies: ["PHP", "MySQL", "JavaScript"],
    projectType: "existing",
    problemStatement: "Customers lack clear shipment updates when parcel tracking is handled manually.",
    mainFeatures: [
      "Shipment registration",
      "Tracking number search",
      "Delivery status updates"
    ]
  },
  {
    title: "Online Auction System",
    abstract: "A web application where registered users can list products and place bids in auctions.",
    domain: "E-Commerce",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Traditional auctions limit participation and make bid tracking difficult.",
    mainFeatures: [
      "Product listing",
      "Bid submission",
      "Auction result display"
    ]
  },
  {
    title: "Digital Certificate Verification System",
    abstract: "A platform for storing certificate records and verifying certificate authenticity.",
    domain: "Document Verification",
    technologies: ["Python", "Django", "PostgreSQL"],
    projectType: "existing",
    problemStatement: "Manual certificate verification can take time and allow fraudulent documents to go unnoticed.",
    mainFeatures: [
      "Certificate record storage",
      "Certificate ID search",
      "Verification status display"
    ]
  },
  {
    title: "Waste Management System",
    abstract: "An application for reporting waste collection needs and organizing collection schedules.",
    domain: "Environmental Technology",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Unorganized waste collection can cause overflowing bins and unhygienic surroundings.",
    mainFeatures: [
      "Waste collection requests",
      "Pickup schedule management",
      "Collection status tracking"
    ]
  },
  {
    title: "Water Quality Monitoring System",
    abstract: "A monitoring solution that records water quality measurements from connected sensors.",
    domain: "Environmental Monitoring",
    technologies: ["Arduino", "Python", "IoT Sensors"],
    projectType: "existing",
    problemStatement: "Periodic manual water testing may fail to identify changing water conditions quickly.",
    mainFeatures: [
      "Sensor data collection",
      "Water quality display",
      "Threshold alerts"
    ]
  },
  {
    title: "Smart Home Automation System",
    abstract: "An IoT-based system for controlling household lights and appliances remotely.",
    domain: "Internet of Things",
    technologies: ["ESP32", "Python", "MQTT"],
    projectType: "existing",
    problemStatement: "Traditional home appliances cannot always be controlled remotely or automatically.",
    mainFeatures: [
      "Remote appliance control",
      "Scheduled device operation",
      "Device status monitoring"
    ]
  },
  {
    title: "Personal Fitness Tracker",
    abstract: "A fitness application for recording workouts, daily steps, and personal activity goals.",
    domain: "Health & Fitness",
    technologies: ["React Native", "Firebase", "JavaScript"],
    projectType: "existing",
    problemStatement: "People may find it difficult to consistently track physical activity and fitness goals.",
    mainFeatures: [
      "Workout logging",
      "Daily activity goals",
      "Fitness progress reports"
    ]
  },
  {
    title: "Mental Wellness Support Platform",
    abstract: "A wellness application offering mood tracking, relaxation exercises, and self-care resources.",
    domain: "Digital Wellness",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "People may need an accessible way to monitor mood and explore basic wellness activities.",
    mainFeatures: [
      "Daily mood journal",
      "Relaxation exercises",
      "Wellness resource library"
    ]
  },
  {
    title: "Vehicle Service Management System",
    abstract: "A system for managing vehicle service appointments, maintenance history, and repair records.",
    domain: "Automotive Services",
    technologies: ["Java", "Spring Boot", "MySQL"],
    projectType: "existing",
    problemStatement: "Vehicle owners may lose track of maintenance schedules and previous repair records.",
    mainFeatures: [
      "Service appointment booking",
      "Maintenance history",
      "Service reminders"
    ]
  },
  {
    title: "Online Resume Builder",
    abstract: "A web application that helps users create and download professional resumes.",
    domain: "Career Development",
    technologies: ["React", "JavaScript", "CSS"],
    projectType: "existing",
    problemStatement: "Creating a properly formatted resume can be difficult for inexperienced job seekers.",
    mainFeatures: [
      "Resume templates",
      "Personal details editor",
      "PDF resume export"
    ]
  },
  {
    title: "Digital Notice Board",
    abstract: "A centralized portal for publishing academic announcements, event notices, and important updates.",
    domain: "Education",
    technologies: ["HTML", "CSS", "PHP", "MySQL"],
    projectType: "existing",
    problemStatement: "Paper notices may be missed by students and are difficult to update quickly.",
    mainFeatures: [
      "Notice publishing",
      "Category-wise announcements",
      "Notice search"
    ]
  },
  {
    title: "Alumni Management System",
    abstract: "A platform for maintaining alumni profiles and sharing college networking opportunities.",
    domain: "Education & Networking",
    technologies: ["React", "Node.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Colleges may struggle to maintain updated alumni information and communication.",
    mainFeatures: [
      "Alumni registration",
      "Alumni directory",
      "Event announcements"
    ]
  },
  {
    title: "Online Grocery Delivery System",
    abstract: "A shopping platform for browsing grocery products and arranging home delivery.",
    domain: "E-Commerce",
    technologies: ["React", "Express.js", "MongoDB"],
    projectType: "existing",
    problemStatement: "Shopping for daily groceries in person can be inconvenient for busy customers.",
    mainFeatures: [
      "Grocery catalog",
      "Cart management",
      "Delivery status tracking"
    ]
  },
  {
    title: "Parking Fine Management System",
    abstract: "A system for recording parking violations, issuing fine details, and tracking payments.",
    domain: "Traffic Management",
    technologies: ["Python", "Flask", "MySQL"],
    projectType: "existing",
    problemStatement: "Paper-based parking fine records can be difficult to maintain and verify.",
    mainFeatures: [
      "Violation record entry",
      "Fine calculation",
      "Payment status tracking"
    ]
  },
  {
    title: "Email Spam Detection System",
    abstract: "A machine learning application that classifies email messages as spam or legitimate.",
    domain: "Cybersecurity & Machine Learning",
    technologies: ["Python", "Scikit-learn", "Pandas"],
    projectType: "existing",
    problemStatement: "Unwanted and fraudulent emails can clutter inboxes and expose users to scams.",
    mainFeatures: [
      "Email text processing",
      "Spam classification",
      "Prediction result display"
    ]
  },
  {
    title: "Fake News Detection System",
    abstract: "A text analysis application that estimates whether a news article resembles known misleading content.",
    domain: "Natural Language Processing",
    technologies: ["Python", "Scikit-learn", "NLTK"],
    projectType: "existing",
    problemStatement: "Misleading online information spreads quickly and can be difficult for readers to evaluate.",
    mainFeatures: [
      "News text input",
      "Text classification",
      "Prediction confidence display"
    ]
  },
  {
    title: "Sign Language Recognition System",
    abstract: "An image-based application that recognizes selected sign language gestures.",
    domain: "Accessibility & AI",
    technologies: ["Python", "OpenCV", "TensorFlow"],
    projectType: "existing",
    problemStatement: "Communication barriers can arise between sign language users and people unfamiliar with signs.",
    mainFeatures: [
      "Gesture image capture",
      "Sign classification",
      "Recognized text display"
    ]
  },
  {
    title: "Smart Traffic Management System",
    abstract: "A traffic monitoring solution that analyzes vehicle flow and adjusts signal timing.",
    domain: "Smart City",
    technologies: ["Python", "OpenCV", "Raspberry Pi"],
    projectType: "existing",
    problemStatement: "Fixed traffic signal timings may contribute to congestion when vehicle flow changes.",
    mainFeatures: [
      "Vehicle count estimation",
      "Traffic density analysis",
      "Signal timing recommendations"
    ]
  },
  {
    title: "Student Performance Prediction System",
    abstract: "A machine learning application that analyzes academic records to estimate student performance.",
    domain: "Educational Data Mining",
    technologies: ["Python", "Pandas", "Scikit-learn"],
    projectType: "existing",
    problemStatement: "Teachers may find it difficult to identify students who need academic support early.",
    mainFeatures: [
      "Academic data analysis",
      "Performance prediction",
      "Student progress reports"
    ]
  },
  {
    title: "Project Similarity Detection System",
    abstract: "A web application that compares student project descriptions and identifies similar submissions.",
    domain: "Artificial Intelligence & Education",
    technologies: ["React", "Node.js", "MongoDB", "Python"],
    projectType: "existing",
    problemStatement: "Reviewing many student projects manually makes it difficult to identify overlapping ideas.",
    mainFeatures: [
      "Project description storage",
      "Text similarity comparison",
      "Similarity score reporting"
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
