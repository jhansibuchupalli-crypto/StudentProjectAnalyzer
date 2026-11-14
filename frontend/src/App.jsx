import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./StudentDashboard.css";
import StudentDashboard from "./StudentDashboard.jsx";
import FacultyDashboard from "./FacultyDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const API = "http://localhost:5000";
const socket = io("http://localhost:5000", {
  autoConnect: false
});
function App() {
    useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
  const [role, setRole] = useState("Student");
  const [showDashboard, setShowDashboard] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState(false);
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [loggedInFaculty, setLoggedInFaculty] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // LOGIN STATES
  const [registerNumber, setRegisterNumber] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // STUDENT REGISTRATION STATES
  const [showRegister, setShowRegister] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentRegisterNumber, setStudentRegisterNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // EMAIL OTP STATES
  const [studentOtp, setStudentOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // PROJECT SUBMISSION STATES
  const [projectTitle, setProjectTitle] = useState("");
  const [projectAbstract, setProjectAbstract] = useState("");
  const [projectDomain, setProjectDomain] = useState("");
  const [projectTechnologies, setProjectTechnologies] = useState("");
  const [projectProblem, setProjectProblem] = useState("");
  const [projectFeatures, setProjectFeatures] = useState("");

  // LOGIN
  const handleLogin = async () => {
    if (!password) {
      alert("Please enter password");
      return;
    }

    if (role === "Student" && !registerNumber.trim()) {
      alert("Please enter Register Number");
      return;
    }

    if (role === "Faculty" && !facultyId.trim()) {
      alert("Please enter Faculty ID");
      return;
    }

    if (role === "Admin" && !username.trim()) {
      alert("Please enter Admin Username");
      return;
    }

    const endpoint =
      role === "Student"
        ? "/api/login"
        : role === "Faculty"
        ? "/api/faculty/login"
        : "/api/admin/login";

    const payload =
      role === "Student"
        ? {
            registerNumber: registerNumber.trim().toUpperCase(),
            password,
          }
        : role === "Faculty"
        ? { facultyId, password }
        : { username, password };

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (role === "Student") {
        setLoggedInStudent(data.student);
        setShowDashboard(true);
        setRegisterNumber("");
      } else if (role === "Faculty") {
        setLoggedInFaculty(data.faculty);
        setFacultyId("");
      } else {
        if (!data.success) {
          alert(data.message || "Invalid admin credentials");
          return;
        }
        setLoggedInAdmin(true);
      }

      setPassword("");
      document.activeElement?.blur();
    } catch (error) {
      console.error("Login error:", error);
      alert("Backend connection failed");
    }
  };

  // PROJECT SUBMISSION
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
      const response = await fetch(`${API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle.trim(),
          domain: projectDomain.trim(),
          registerNumber: loggedInStudent.registerNumber,
          abstract: projectAbstract.trim(),
          technologies: projectTechnologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          problemStatement: projectProblem.trim(),
          mainFeatures: projectFeatures
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Project submission failed");
        return;
      }

      alert("Project submitted successfully!");

      setProjectTitle("");
      setProjectDomain("");
      setProjectAbstract("");
      setProjectTechnologies("");
      setProjectProblem("");
      setProjectFeatures("");
      setShowSubmitForm(false);
      setShowDashboard(true);
    } catch (error) {
      console.error("Project submission error:", error);
      alert("Error: " + error.message);
    }
  };

  // VALIDATIONS
  const passwordValid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,64}$/.test(
      studentPassword
    );

  const registerNumberValid = (value) => {
    const match = /^U23(CS|AI|ID|IB|DS|ML)(\d{4,})$/.exec(value);
    return Boolean(match && /[1-9]/.test(match[2]));
  };

  const emailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // RESET OTP
  const resetOtp = () => {
    setStudentOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setVerifiedEmail("");
  };

  // SEND OTP
const handleSendOtp = async () => {
  const name = studentName.trim();
  const number = studentRegisterNumber.trim().toUpperCase();
  const email = studentEmail.trim().toLowerCase();

  if (!name || !number) {
    alert("Please enter your name and register number first.");
    return;
  }

  if (!registerNumberValid(number)) {
    alert("Please enter a valid register number.");
    return;
  }

  if (!emailValid(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (otpLoading || otpVerified) return;

  try {
    setOtpLoading(true);

    const response = await fetch(`${API}/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        registerNumber: number,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to send OTP.");
      return;
    }

    setOtpSent(true);
    setOtpVerified(false);
    setVerifiedEmail("");
    setStudentOtp("");

    alert("OTP sent successfully! Check your email.");
  } catch (error) {
    console.error("Send OTP error:", error);
    alert("Unable to connect to backend.");
  } finally {
    setOtpLoading(false);
  }
};

// VERIFY OTP
const handleVerifyOtp = async () => {
  const email = studentEmail.trim().toLowerCase();

  if (!otpSent) {
    alert("Please send OTP first.");
    return;
  }

  if (!/^\d{6}$/.test(studentOtp.trim())) {
    alert("Please enter a valid 6-digit OTP.");
    return;
  }

  if (otpLoading) return;

  try {
    setOtpLoading(true);

    const response = await fetch(`${API}/api/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: studentOtp.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "OTP verification failed.");
      return;
    }

    setOtpVerified(true);
    setVerifiedEmail(email);

    alert("Email verified successfully!");
  } catch (error) {
    console.error("Verify OTP error:", error);
    alert("Unable to connect to backend.");
  } finally {
    setOtpLoading(false);
  }
};


  // STUDENT REGISTRATION
  const handleStudentRegistration = async (e) => {
    e.preventDefault();

    if (registrationLoading) return;

    const name = studentName.trim();
    const number = studentRegisterNumber.trim().toUpperCase();
    const email = studentEmail.trim().toLowerCase();

    if (
      !name ||
      !number ||
      !email ||
      !studentPassword ||
      !studentConfirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (!registerNumberValid(number)) {
      alert(
        "Invalid Register Number. Example: U23CS0133. Allowed branches: CS, AI, ID, IB, DS, ML."
      );
      return;
    }

    if (!emailValid(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!passwordValid) {
      alert(
        "Password must have 8-64 characters, uppercase, lowercase, number, special character and no spaces."
      );
      return;
    }

    if (studentPassword !== studentConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!otpVerified || verifiedEmail !== email) {
      alert("Please verify your email using OTP before registering.");
      return;
    }

    try {
      setRegistrationLoading(true);

      const response = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          registerNumber: number,
          email,
          password: studentPassword,
          confirmPassword: studentConfirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Student registered successfully! You can now login.");

      setStudentName("");
      setStudentRegisterNumber("");
      setStudentEmail("");
      setStudentPassword("");
      setStudentConfirmPassword("");
      setShowStudentPassword(false);
      setShowConfirmPassword(false);
      resetOtp();
      setShowRegister(false);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Backend connection failed");
    } finally {
      setRegistrationLoading(false);
    }
  };

  // ADMIN DASHBOARD
  if (loggedInAdmin) {
    return (
      <AdminDashboard
        onLogout={() => {
          setLoggedInAdmin(false);
          setUsername("");
          setPassword("");
        }}
      />
    );
  }

  // FACULTY DASHBOARD
  if (loggedInFaculty) {
    return (
    <FacultyDashboard
  faculty={loggedInFaculty}
  socket={socket}
  onLogout={() => setLoggedInFaculty(null)}
/>
    );
  }

  // PROJECT SUBMISSION FORM
  if (showSubmitForm && loggedInStudent) {
    return (
      <div style={projectStyles.page}>
        <div style={projectStyles.card}>
          <button
            type="button"
            style={projectStyles.backButton}
            onClick={() => {
              setShowSubmitForm(false);
              setShowDashboard(true);
            }}
          >
            ← Back to Dashboard
          </button>

          <h1 style={projectStyles.title}>Submit New Project</h1>
          <p style={projectStyles.subtitle}>
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

            <button type="submit" style={projectStyles.submitButton}>
              Submit Project
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STUDENT DASHBOARD
  if (showDashboard && loggedInStudent) {
    return (
      <StudentDashboard
        student={loggedInStudent}
        socket={socket}
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

  // STUDENT REGISTRATION - REDESIGNED
  if (showRegister) {
    return (
      <div style={registrationStyles.page}>
        <div style={registrationStyles.card}>
          <div style={registrationStyles.header}>
            <div style={registrationStyles.logo}>🎓</div>

            <h1 style={registrationStyles.heading}>
              Student Registration
            </h1>

            <p style={registrationStyles.subtitle}>
              Create your account to explore and submit projects
            </p>
          </div>

          <form onSubmit={handleStudentRegistration}>
            {/* FULL NAME AND REGISTER NUMBER */}
            <div style={registrationStyles.twoColumns}>
              <div style={registrationStyles.field}>
                <label style={registrationStyles.label}>
                  Full Name
                </label>

                <input
                  style={registrationStyles.input}
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => {
  setStudentName(e.target.value);
  resetOtp();
}}
                  autoComplete="name"
                  required
                />
              </div>

              <div style={registrationStyles.field}>
                <label style={registrationStyles.label}>
                  Register Number
                </label>

                <input
                  style={registrationStyles.input}
                  type="text"
                  placeholder="e.g., U23CS0133"
                  value={studentRegisterNumber}
                 onChange={(e) => {
  setStudentRegisterNumber(e.target.value.toUpperCase());
  resetOtp();
}}
                  required
                />

                {studentRegisterNumber.length > 0 && (
                  <p
                    style={{
                      ...registrationStyles.hint,
                      color: registerNumberValid(
                        studentRegisterNumber.trim()
                      )
                        ? "#15803d"
                        : "#dc2626",
                    }}
                  >
                    {registerNumberValid(
                      studentRegisterNumber.trim()
                    )
                      ? "✓ Valid register number"
                      : "Enter a valid U23 register number"}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL AND OTP */}
            <div style={registrationStyles.field}>
              <label style={registrationStyles.label}>
                Email Address
              </label>

              <div style={registrationStyles.inlineRow}>
                <input
                  style={{
                    ...registrationStyles.input,
                    flex: 1,
                    minWidth: 0,
                  }}
                  type="email"
                  placeholder="Enter your email address"
                  value={studentEmail}
                  onChange={(e) => {
                    setStudentEmail(e.target.value);
                    resetOtp();
                  }}
                  autoComplete="email"
                  required
                />

                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    style={{
                      ...registrationStyles.otpButton,
                      opacity: otpLoading ? 0.6 : 1,
                    }}
                  >
                    {otpLoading
                      ? "Please Wait..."
                      : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
                  </button>
                )}
              </div>

              {otpVerified && (
                <p style={registrationStyles.success}>
                  ✓ Email Verified Successfully
                </p>
              )}
            </div>

            {/* OTP VERIFICATION */}
            {otpSent && !otpVerified && (
              <div style={registrationStyles.otpSection}>
                <label style={registrationStyles.label}>
                  Enter Verification Code
                </label>

                <div style={registrationStyles.inlineRow}>
                  <input
                    style={{
                      ...registrationStyles.input,
                      flex: 1,
                      minWidth: 0,
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={studentOtp}
                    onChange={(e) =>
                      setStudentOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={
                      otpLoading || studentOtp.length !== 6
                    }
                    style={{
                      ...registrationStyles.verifyButton,
                      opacity:
                        otpLoading || studentOtp.length !== 6
                          ? 0.6
                          : 1,
                    }}
                  >
                    {otpLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>

                <p style={registrationStyles.hint}>
                  OTP is valid for 5 minutes.
                </p>
              </div>
            )}

            {/* PASSWORD AND CONFIRM PASSWORD */}
            <div style={registrationStyles.twoColumns}>
              <div style={registrationStyles.field}>
                <label style={registrationStyles.label}>
                  Create Password
                </label>

                <div style={registrationStyles.passwordWrapper}>
                  <input
                    style={{
                      ...registrationStyles.input,
                      paddingRight: "65px",
                    }}
                    type={
                      showStudentPassword ? "text" : "password"
                    }
                    placeholder="Enter password"
                    value={studentPassword}
                    onChange={(e) =>
                      setStudentPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    style={registrationStyles.showButton}
                    onClick={() =>
                      setShowStudentPassword(!showStudentPassword)
                    }
                  >
                    {showStudentPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div style={registrationStyles.field}>
                <label style={registrationStyles.label}>
                  Confirm Password
                </label>

                <div style={registrationStyles.passwordWrapper}>
                  <input
                    style={{
                      ...registrationStyles.input,
                      paddingRight: "65px",
                    }}
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Re-enter password"
                    value={studentConfirmPassword}
                    onChange={(e) =>
                      setStudentConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    style={registrationStyles.showButton}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* PASSWORD VALIDATION */}
            <p
              style={{
                ...registrationStyles.hint,
                color:
                  studentPassword.length > 0 && passwordValid
                    ? "#15803d"
                    : "#64748b",
              }}
            >
              {studentPassword.length > 0 && passwordValid
                ? "✓ Strong password — all requirements met"
                : "Use 8–64 characters with uppercase, lowercase, number and special character. No spaces."}
            </p>

            {studentConfirmPassword.length > 0 && (
              <p
                style={{
                  ...registrationStyles.hint,
                  color:
                    studentPassword === studentConfirmPassword
                      ? "#15803d"
                      : "#dc2626",
                }}
              >
                {studentPassword === studentConfirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              disabled={registrationLoading}
              style={{
                ...registrationStyles.registerButton,
                opacity: registrationLoading ? 0.7 : 1,
                cursor: registrationLoading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {registrationLoading
                ? "Creating Account..."
                : "Create Student Account"}
            </button>

            <div style={registrationStyles.loginText}>
              Already have an account?{" "}
              <button
                type="button"
                style={registrationStyles.loginLink}
                onClick={() => {
  setShowRegister(false);
  resetOtp();
}}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // MAIN LOGIN PAGE
  return (
    <div style={styles.page}>
      <div style={styles.leftSection}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>🎓</div>
          <h1 style={styles.projectName}>
            Project Similarity Analyzer
          </h1>
        </div>

        <p style={styles.tagline}>
          Detect Similarity &nbsp;•&nbsp; Find Novelty
          &nbsp;•&nbsp; Encourage Originality
        </p>

        <h2 style={styles.chooseTitle}>Choose Your Role</h2>

        <div style={styles.roleContainer}>
          <div
            onClick={() => setRole("Student")}
            style={{
              ...styles.roleCard,
              ...(role === "Student" ? styles.studentActive : {}),
            }}
          >
            <div style={styles.roleIcon}>🎓</div>
            <h3 style={styles.roleTitle}>Student</h3>
            <p style={styles.roleDescription}>
              Submit your project
              <br />
              and track status
            </p>
            <div style={styles.arrow}>→</div>
          </div>

          <div
            onClick={() => setRole("Faculty")}
            style={{
              ...styles.roleCard,
              ...(role === "Faculty" ? styles.facultyActive : {}),
            }}
          >
            <div style={styles.roleIcon}>👨‍🏫</div>
            <h3 style={styles.roleTitle}>Faculty</h3>
            <p style={styles.roleDescription}>
              Review projects and
              <br />
              provide feedback
            </p>
            <div style={styles.arrow}>→</div>
          </div>

          <div
            onClick={() => setRole("Admin")}
            style={{
              ...styles.roleCard,
              ...(role === "Admin" ? styles.adminActive : {}),
            }}
          >
            <div style={styles.roleIcon}>⚙️</div>
            <h3 style={styles.roleTitle}>Admin</h3>
            <p style={styles.roleDescription}>
              Manage users and
              <br />
              system settings
            </p>
            <div style={styles.arrow}>→</div>
          </div>
        </div>

        <div style={styles.loginBox}>
          {role === "Student" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Register Number (e.g., U23CS0133)"
                value={registerNumber}
                onChange={(e) =>
                  setRegisterNumber(e.target.value)
                }
                style={styles.input}
              />
            </div>
          )}

          {role === "Faculty" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Faculty ID"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          {role === "Admin" && (
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.inputBox}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button
            onClick={handleLogin}
            style={styles.loginButton}
          >
            Login
          </button>

          {role === "Student" && (
            <p style={styles.registerText}>
              Don't have an account?{" "}
              <span
                style={styles.registerLink}
                onClick={() => setShowRegister(true)}
              >
                Register
              </span>
            </p>
          )}
        </div>
      </div>

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

// PROJECT FORM STYLES
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

const projectStyles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8fc",
    padding: "30px 16px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    background: "#ffffff",
    border: "1px solid #dbe5f0",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(20,50,80,0.08)",
    boxSizing: "border-box",
  },
  backButton: {
    padding: "10px 16px",
    background: "#234b6b",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
  title: {
    textAlign: "center",
    color: "#234b6b",
    fontSize: "32px",
    margin: "25px 0 8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "28px",
  },
  submitButton: {
    padding: "14px",
    background: "#234b6b",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
  },
};

// STUDENT REGISTRATION STYLES - NEW DESIGN
const registrationStyles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #eef2ff 55%, #f5f3ff 100%)",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "680px",
    padding: "30px",
    boxSizing: "border-box",
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 40px rgba(30,58,138,0.10)",
  },

  header: {
    textAlign: "center",
    marginBottom: "25px",
  },

  logo: {
    width: "52px",
    height: "52px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 12px",
    background: "#eef2ff",
    borderRadius: "14px",
    fontSize: "27px",
  },

  heading: {
    margin: "0 0 8px",
    color: "#1e3a8a",
    fontSize: "26px",
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "16px",
  },

  field: {
    marginBottom: "17px",
    minWidth: 0,
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
  },

  input: {
    display: "block",
    width: "100%",
    height: "44px",
    padding: "0 13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    outlineColor: "#6366f1",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#1e293b",
  },

  inlineRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  otpButton: {
    height: "44px",
    padding: "0 16px",
    border: "none",
    borderRadius: "9px",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  verifyButton: {
    height: "44px",
    padding: "0 16px",
    border: "none",
    borderRadius: "9px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  otpSection: {
    padding: "15px",
    marginBottom: "18px",
    background: "#f0f7ff",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
  },

  success: {
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "600",
    margin: "9px 0 0",
  },

  passwordWrapper: {
    position: "relative",
  },

  showButton: {
    position: "absolute",
    right: "12px",
    top: "13px",
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  hint: {
    fontSize: "11px",
    color: "#64748b",
    margin: "6px 0 12px",
    lineHeight: "1.5",
  },

  registerButton: {
    width: "100%",
    height: "47px",
    marginTop: "12px",
    border: "none",
    borderRadius: "9px",
    background:
      "linear-gradient(90deg, #2563eb, #6366f1)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 5px 14px rgba(79,70,229,0.18)",
  },

  loginText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#64748b",
    fontSize: "13px",
  },

  loginLink: {
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

// MAIN LOGIN PAGE STYLES
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "Arial, Helvetica, sans-serif",
    background: "#f7faff",
  },

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

  loginBox: {
    marginTop: "38px",
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 4px 18px rgba(20,60,100,0.08)",
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