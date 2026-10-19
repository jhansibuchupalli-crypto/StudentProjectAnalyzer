import { useState } from "react";
import "./StudentDashboard.css";
import StudentDashboard from "./StudentDashboard";

function App() {
  const [role, setRole] = useState("Student");
  const [showDashboard, setShowDashboard] = useState(false);
  const [loggedInStudent, setLoggedInStudent] = useState(null);
const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [registerNumber, setRegisterNumber] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentRegisterNumber, setStudentRegisterNumber] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
const [projectAbstract, setProjectAbstract] = useState("");
const [projectDomain, setProjectDomain] = useState("");
const [projectTechnologies, setProjectTechnologies] = useState("");
const [projectProblem, setProjectProblem] = useState("");
const [projectFeatures, setProjectFeatures] = useState("");

  const handleLogin = async () => {
    if (!password) {
      alert("Please enter password");
      return;
    }

    if (role === "Student") {
      if (!registerNumber) {
        alert("Please enter Register Number");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              registerNumber,
              password,
            }),
          }
        );

        const data = await response.json();

       
if (response.ok) {
  setLoggedInStudent(data.student);
  setShowDashboard(true);

  setRegisterNumber("");
  setPassword("");
  document.activeElement.blur();
} else {
  alert(data.message);
} 

      } catch (error) {
        alert("Backend connection failed");
      }
    }

    if (role === "Faculty") {
      if (!facultyId) {
        alert("Please enter Faculty ID");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/faculty/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              facultyId,
              password,
            }),
          }
        );

        const data = await response.json();

       if (response.ok) {
  alert("Faculty login successful");

  setFacultyId("");
  setPassword("");
  document.activeElement.blur();
} else {
  alert(data.message);
}
      } catch (error) {
        alert("Backend connection failed");
      }
    }

    if (role === "Admin") {
      if (!username) {
        alert("Please enter Admin Username");
        return;
      }

      alert("Admin login will be connected in the next step.");
    }
  };
  
  const handleProjectSubmit = async () => {
   if (
  !projectTitle.trim() ||
  !projectDomain.trim() ||
  !projectAbstract.trim() ||
  !projectTechnologies.trim() ||
  !projectProblem.trim() ||
  !projectFeatures.trim()
) {
  alert("Please fill all project fields");
  return;
}

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  title: projectTitle.trim(),
  domain: projectDomain.trim(),
  abstract: projectAbstract.trim(),
  technologies: projectTechnologies
    .split(",")
    .map(item => item.trim())
    .filter(Boolean),
  problemStatement: projectProblem.trim(),
  mainFeatures: projectFeatures
    .split(",")
    .map(item => item.trim())
    .filter(Boolean),
}),
      });

      const data = await response.json();

     if (response.ok) {
  alert("Project submitted successfully!");

  setProjectTitle("");
  setProjectDomain("");
  setProjectAbstract("");
  setProjectTechnologies("");
  setProjectProblem("");
  setProjectFeatures("");

  setShowSubmitForm(false);
  setShowDashboard(true);
}
       else {
        alert(data.message || "Project submission failed");
      }
    } catch (error) {
      alert("Backend connection failed");
    }
  };
 
if (showSubmitForm && loggedInStudent) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8fc",
        padding: "30px 16px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px",
          background: "#ffffff",
          border: "1px solid #dbe5f0",
          borderRadius: "14px",
          boxShadow: "0 8px 25px rgba(20, 50, 80, 0.08)",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowSubmitForm(false);
            setShowDashboard(true);
          }}
          style={{
            padding: "10px 16px",
            background: "#234b6b",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>

        <h1
          style={{
            textAlign: "center",
            color: "#234b6b",
            fontSize: "32px",
            margin: "25px 0 8px",
          }}
        >
          Submit New Project
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Enter your project details below.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProjectSubmit();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <label style={formLabelStyle}>Project Title *</label>
          <input
            style={formInputStyle}
            placeholder="Enter project title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <label style={formLabelStyle}>Project Domain *</label>
          <input
            style={formInputStyle}
            placeholder="Enter project domain"
            value={projectDomain}
            onChange={(e) => setProjectDomain(e.target.value)}
            required
          />

          <label style={formLabelStyle}>Abstract *</label>
          <textarea
            style={formInputStyle}
            placeholder="Describe your project"
            rows={4}
            value={projectAbstract}
            onChange={(e) => setProjectAbstract(e.target.value)}
            required
          />

          <label style={formLabelStyle}>Technologies *</label>
          <input
            style={formInputStyle}
            placeholder="React, Node.js, MongoDB"
            value={projectTechnologies}
            onChange={(e) => setProjectTechnologies(e.target.value)}
            required
          />

          <label style={formLabelStyle}>Problem Statement *</label>
          <textarea
            style={formInputStyle}
            placeholder="What problem does your project solve?"
            rows={3}
            value={projectProblem}
            onChange={(e) => setProjectProblem(e.target.value)}
            required
          />

          <label style={formLabelStyle}>Main Features *</label>
          <textarea
            style={formInputStyle}
            placeholder="Enter features separated by commas"
            rows={3}
            value={projectFeatures}
            onChange={(e) => setProjectFeatures(e.target.value)}
            required
          />

          <button
            type="submit"
            style={{
              padding: "14px",
              background: "#234b6b",
              color: "#ffffff",
              border: "none",
              borderRadius: "7px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Submit Project
          </button>
        </form>
      </div>
    </div>
  );
}

    
if (showDashboard && loggedInStudent) {
  return (
    <StudentDashboard
      student={loggedInStudent}
      onLogout={() => {
        setShowDashboard(false);
        setLoggedInStudent(null);
        setRegisterNumber("");
        setPassword("");
      }}
      onSubmitProject={() => {
  setShowDashboard(false);
  setShowSubmitForm(true);
}}
    />
  );
}

  if (showRegister) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "36px",
            boxSizing: "border-box",
            background: "#fff",
            borderRadius: "22px",
            boxShadow: "0 15px 45px rgba(60,70,130,0.18)",
          }}
        >
         
<h1
  style={{
    margin: "0 0 12px",
    textAlign: "center",
    color: "#1e3a8a",
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1.2",
    whiteSpace: "nowrap",
  }}
>
  Student Registration
</h1>

          <p style={{ textAlign: "center", color: "#64748b" }}>
            Create your student account
          </p>

          <input
            style={registrationStyles.input}
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />

          <input
            style={registrationStyles.input}
            placeholder="Register Number"
            value={studentRegisterNumber}
            onChange={(e) => setStudentRegisterNumber(e.target.value)}
          />

          <input
            style={registrationStyles.input}
            type="password"
            placeholder="Password"
            value={studentPassword}
            onChange={(e) => setStudentPassword(e.target.value)}
          />

          <button
            style={registrationStyles.registerButton}
            onClick={async () => {
              if (!studentName.trim() || !studentRegisterNumber.trim() || !studentPassword) {
                alert("Please fill all fields");
                return;
              }

              try {
                const response = await fetch("http://localhost:5000/api/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: studentName.trim(),
                    registerNumber: studentRegisterNumber.trim(),
                    password: studentPassword,
                  }),
                });

                const data = await response.json();
                console.log("PROJECT API RESPONSE:", data);

                if (response.ok) {
                  alert("Student registered successfully!");
                  setStudentName("");
                  setStudentRegisterNumber("");
                  setStudentPassword("");
                  setShowRegister(false);
                } else {
                  alert(data.message || "Registration failed");
                }
              } catch (error) {
                alert("Backend connection failed");
              }
            }}
          >
            Create Student Account
          </button>

          <button
            style={registrationStyles.backButton}
            onClick={() => setShowRegister(false)}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div style={styles.page}>

      {/* LEFT SIDE */}
      <div style={styles.leftSection}>

        <div style={styles.logoSection}>
          <div style={styles.logo}>🎓</div>

          <h1 style={styles.projectName}>
            Project Similarity Analyzer
          </h1>
        </div>

        <p style={styles.tagline}>
          Detect Similarity&nbsp;&nbsp;•&nbsp;&nbsp;
          Find Novelty&nbsp;&nbsp;•&nbsp;&nbsp;
          Encourage Originality
        </p>

        <h2 style={styles.chooseTitle}>
          Choose Your Role
        </h2>

        {/* ROLE CARDS */}
        <div style={styles.roleContainer}>

          {/* STUDENT */}
          <div
            onClick={() => setRole("Student")}
            style={{
              ...styles.roleCard,
              ...(role === "Student"
                ? styles.studentActive
                : {}),
            }}
          >
            <div style={styles.roleIcon}>🎓</div>

            <h3 style={styles.roleTitle}>
              Student
            </h3>

            <p style={styles.roleDescription}>
              Submit your project
              <br />
              and track status
            </p>

            <div style={styles.arrow}>
              →
            </div>
          </div>

          {/* FACULTY */}
          <div
            onClick={() => setRole("Faculty")}
            style={{
              ...styles.roleCard,
              ...(role === "Faculty"
                ? styles.facultyActive
                : {}),
            }}
          >
            <div style={styles.roleIcon}>👨‍🏫</div>

            <h3 style={styles.roleTitle}>
              Faculty
            </h3>

            <p style={styles.roleDescription}>
              Review projects and
              <br />
              provide feedback
            </p>

            <div style={styles.arrow}>
              →
            </div>
          </div>

          {/* ADMIN */}
          <div
            onClick={() => setRole("Admin")}
            style={{
              ...styles.roleCard,
              ...(role === "Admin"
                ? styles.adminActive
                : {}),
            }}
          >
            <div style={styles.roleIcon}>⚙️</div>

            <h3 style={styles.roleTitle}>
              Admin
            </h3>

            <p style={styles.roleDescription}>
              Manage users and
              <br />
              system settings
            </p>

            <div style={styles.arrow}>
              →
            </div>
          </div>

        </div>

        {/* LOGIN BOX */}
        <div style={styles.loginBox}>

          {/* STUDENT INPUT */}
          {role === "Student" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>

              <input
                type="text"
                placeholder="Email / Register Number"
                value={registerNumber}
                onChange={(e) =>
                  setRegisterNumber(e.target.value)
                }
                style={styles.input}
              />
            </div>
          )}

          {/* FACULTY INPUT */}
          {role === "Faculty" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>

              <input
                type="text"
                placeholder="Faculty ID"
                value={facultyId}
                onChange={(e) =>
                  setFacultyId(e.target.value)
                }
                style={styles.input}
              />
            </div>
          )}

          {/* ADMIN INPUT */}
          {role === "Admin" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>

              <input
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                style={styles.input}
              />
            </div>
          )}

          {/* PASSWORD */}
          <div style={styles.inputBox}>
            <span style={styles.inputIcon}>🔒</span>

            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={styles.input}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            style={styles.loginButton}
          >
            Login
          </button>

          {/* REGISTER */}
          {role === "Student" && (
          <p style={styles.registerText}>
  Don't have an account?
  <span
    style={styles.registerLink}
    onClick={()=>setShowRegister(true)}
  >
    &nbsp;Register
  </span>
</p>
          )}

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightSection}>

        <div style={styles.overlay}>
          <h2 style={styles.rightTitle}>
            Better Projects,
            <br />
            Stronger Innovation
          </h2>

          <p style={styles.rightDescription}>
            AI-powered analysis to ensure
            <br />
            originality in student projects.
          </p>
        </div>

      </div>

    </div>
  );
}
const formLabelStyle = {
  color: "#334155",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "-10px",
};

const formInputStyle = {
  display: "block",
  width: "100%",
  padding: "13px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "15px",
  fontFamily: "Arial, sans-serif",
  color: "#10284a",
  background: "#ffffff",
};

const registrationStyles = {
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    display: "block",
    width: "100%",
    height: "48px",
    padding: "0 14px",
    marginBottom: "20px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    outline: "none",
    fontSize: "15px",
    background: "#f8fafc",
    color: "#1e293b",
  },
  registerButton: {
    width: "100%",
    minHeight: "50px",
    marginTop: "6px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 5px 14px rgba(79, 70, 229, 0.22)",
  },
  backButton: {
    width: "100%",
    minHeight: "46px",
    marginTop: "12px",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    background: "#f7faff",
  },

  /* LEFT */

  leftSection: {
    width: "56%",
    padding: "25px 70px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #ffffff, #f4f8ff)",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  logo: {
    fontSize: "45px",
  },

  projectName: {
    margin: 0,
    color: "#123b70",
    fontSize: "34px",
    fontWeight: "700",
  },

  tagline: {
    marginTop: "18px",
    color: "#68788f",
    fontSize: "17px",
    letterSpacing: "0.3px",
  },

  chooseTitle: {
    textAlign: "center",
    marginTop: "40px",
    color: "#123b70",
    fontSize: "29px",
  },

  roleContainer: {
    display: "flex",
    gap: "22px",
    justifyContent: "center",
    marginTop: "28px",
  },

  roleCard: {
    width: "150px",
    minHeight: "150px",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #d6e1ef",
    background: "#ffffff",
    textAlign: "center",
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "0.2s",
  },

  studentActive: {
    background: "#edf6ff",
    border: "2px solid #76b9ff",
  },

  facultyActive: {
    background: "#f4f0ff",
    border: "2px solid #a78bfa",
  },

  adminActive: {
    background: "#effbf4",
    border: "2px solid #72c995",
  },

  roleIcon: {
    fontSize: "43px",
    marginTop: "5px",
  },

  roleTitle: {
    fontSize: "21px",
    color: "#173e72",
    margin: "12px 0",
  },

  roleDescription: {
    color: "#69788d",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  arrow: {
    margin: "15px auto 0",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#e8f2ff",
    color: "#1769c2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
  },

  /* LOGIN */

  loginBox: {
    marginTop: "38px",
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 18px rgba(20,60,100,0.08)",
  },

  inputBox: {
    height: "52px",
    border: "1px solid #d8e1ec",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    padding: "0 15px",
    boxSizing: "border-box",
  },

  inputIcon: {
    marginRight: "12px",
    fontSize: "18px",
  },

  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "16px",
    color: "#333",
  },

  loginButton: {
    width: "100%",
    height: "52px",
    marginTop: "7px",
    border: "none",
    borderRadius: "8px",
    background:
      "linear-gradient(90deg, #1976d2, #1769c2)",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
  },

  registerText: {
    textAlign: "center",
    color: "#68788f",
    marginTop: "20px",
    marginBottom: "4px",
  },

  registerLink: {
    color: "#1769c2",
    fontWeight: "600",
    cursor: "pointer",
  },

  /* RIGHT */

  rightSection: {
    width: "44%",
    minHeight: "750px",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(17,91,161,0.82), rgba(35,119,192,0.45))",
    padding: "150px 70px",
    boxSizing: "border-box",
  },

  rightTitle: {
    color: "#ffffff",
    fontSize: "44px",
    lineHeight: "1.25",
    margin: 0,
    fontWeight: "700",
  },

  rightDescription: {
    color: "#ffffff",
    fontSize: "21px",
    lineHeight: "1.6",
    marginTop: "30px",
  },

};

export default App;