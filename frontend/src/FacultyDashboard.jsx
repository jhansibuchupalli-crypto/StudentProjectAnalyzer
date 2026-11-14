
import { useEffect, useState } from "react";
import "./FacultyDashboard.css";
import "./SimilarityAnalysis.css";

const API = "http://localhost:5000/api/projects";
const SIMILARITY_API = "http://localhost:5000/api/similarity-analysis";

const projectDetailFields = [
  ["Abstract", ["abstract", "projectAbstract"]],
  ["Domain", ["domain"]],
  ["Problem Statement", ["problemStatement", "problem_statement"]],
  ["Objectives", ["objectives", "projectObjectives"]],
  ["Methodology", ["methodology"]],
  ["Technologies", ["technologies", "techStack", "technology", "tech_stack"]],
  ["Main Features", ["mainFeatures", "features", "main_features"]],
  ["Keywords", ["keywords"]],
  ["Expected Outcome", ["expectedOutcome", "outcome"]],
];

const getProjectDetail = (project, keys) => {
  for (const key of keys) {
    const value = project?.[key];

    if (Array.isArray(value)) {
      const result = value
        .flat(Infinity)
        .map((item) =>
          typeof item === "object" && item !== null
            ? item.name || item.title || ""
            : String(item ?? "").trim()
        )
        .filter(Boolean)
        .join(", ");

      if (result) return result;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") return String(value);
  }

  return "";
};

const formatScore = (score) => {
  const number = Number(score);
  return Number.isFinite(number) ? number : 0;
};

export default function FacultyDashboard({ faculty, onLogout, socket }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activePage, setActivePage] = useState("Dashboard");

  const [selectedProject, setSelectedProject] = useState(null);
  const [similarityReport, setSimilarityReport] = useState(null);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarityError, setSimilarityError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const facultyName =
    faculty?.name || faculty?.facultyId || "Faculty";

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to load projects.");
      }

      const data = await response.json();

      setProjects(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Projects load avvaledu. Backend check cheyyi.");
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
    if (!socket) return;

    const handleNewProject = (data) => {
      const newProject = data?.project;

      if (!newProject?._id) return;

      setProjects((previousProjects) => {
        const alreadyExists = previousProjects.some(
          (project) => project._id === newProject._id
        );

        if (alreadyExists) {
          return previousProjects.map((project) =>
            project._id === newProject._id
              ? { ...project, ...newProject }
              : project
          );
        }

        return [newProject, ...previousProjects];
      });

      console.log("New project received:", newProject.title);
    };

    socket.on("newProjectSubmitted", handleNewProject);

    return () => {
      socket.off("newProjectSubmitted", handleNewProject);
    };
  }, [socket]);
const statusOf = (project) =>
  project?.status || "Pending";
  const pending = projects.filter(
    (project) => statusOf(project) === "Pending"
  ).length;

  const approved = projects.filter(
    (project) => statusOf(project) === "Approved"
  ).length;

  const rejected = projects.filter(
    (project) => statusOf(project) === "Rejected"
  ).length;

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();

    const matchesSearch =
      (project.title || "").toLowerCase().includes(query) ||
      (project.studentRegisterNumber || "")
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      statusFilter === "All Status" ||
      statusOf(project) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const closeSimilarityReport = () => {
    setSelectedProject(null);
    setSimilarityReport(null);
    setSimilarityError("");
    setSelectedMatch(null);
    setStatusMessage("");
    setStatusError("");
  };

  // ==========================================
  // PROJECT ANALYSIS API
  // ==========================================

  const runSimilarityAnalysis = async (project) => {
    setSelectedProject(project);
    setSelectedMatch(null);
    setSimilarityReport(null);
    setSimilarityError("");
    setSimilarityLoading(true);
    setStatusMessage("");
    setStatusError("");

    try {
      const response = await fetch(SIMILARITY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project._id,
          title: project.title || "",
          abstract: project.abstract || "",
          domain: project.domain || "",
          technologies: project.technologies || [],
          problemStatement: project.problemStatement || "",
          mainFeatures: project.mainFeatures || [],
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Project analysis failed."
        );
      }

      setSimilarityReport(data);
    } catch (err) {
      setSimilarityError(
        err.message || "Unable to analyze project."
      );
    } finally {
      setSimilarityLoading(false);
    }
  };

  // ==========================================
  // APPROVE / REJECT PROJECT
  // ==========================================

  const updateProjectStatus = async (status) => {
    if (!selectedProject?._id || statusUpdating) return;

    const confirmed = window.confirm(
      "Are you sure you want to " +
        status.toLowerCase() +
        " this project?"
    );

    if (!confirmed) return;

    setStatusUpdating(true);
    setStatusMessage("");
    setStatusError("");

    try {
      const response = await fetch(
        `${API}/${selectedProject._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to update project status."
        );
      }

      const updatedProject = data.project;

      if (!updatedProject) {
        throw new Error("Updated project data was not returned.");
      }

      setProjects((previous) =>
        previous.map((project) =>
          project._id === updatedProject._id
            ? { ...project, ...updatedProject }
            : project
        )
      );

      setSelectedProject((previous) =>
        previous?._id === updatedProject._id
          ? { ...previous, ...updatedProject }
          : previous
      );

      setStatusMessage(`Project ${status} successfully!`);
    } catch (err) {
      setStatusError(
        err.message || "Status update failed."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  // ==========================================
  // PROJECT ANALYSIS REPORT
  // ==========================================

  if (selectedProject) {
    const novelty = similarityReport?.noveltyAnalysis;
    const differentiation =
      similarityReport?.differentiationAnalysis;

    const noveltyScore = Math.min(
      100,
      Math.max(0, formatScore(novelty?.noveltyScore))
    );

    return (
      <div className="faculty-similarity-page">
        {selectedMatch ? (
          <>
            {/* MATCHING PROJECT DETAILS */}

            <div className="similarity-page-header">
              <h1>Matching Project Details</h1>

              <button
                type="button"
                className="sd-primary"
                onClick={() => setSelectedMatch(null)}
              >
                ← Back to Similarity Report
              </button>
            </div>

            <div className="similarity-detail-card">
              <div className="similarity-detail-heading">
                <div>
                  <span className="similarity-detail-label">
                    MATCHING PROJECT
                  </span>

                  <h2>
                    {selectedMatch.projectTitle ||
                      selectedMatch.title ||
                      "Untitled Project"}
                  </h2>
                </div>

                <div className="similarity-detail-score">
                  <strong>
                    {selectedMatch.overallSimilarity ?? 0}%
                  </strong>
                  <span>Similarity</span>
                </div>
              </div>

              <div className="similarity-detail-body">
                {projectDetailFields.map(([label, keys]) => {
                  const value = getProjectDetail(
                    selectedMatch,
                    keys
                  );

                  if (!value) return null;

                  return (
                    <section
                      className="similarity-detail-section"
                      key={label}
                    >
                      <h3>{label}</h3>
                      <p>{value}</p>
                    </section>
                  );
                })}

                {!projectDetailFields.some(([, keys]) =>
                  getProjectDetail(selectedMatch, keys)
                ) && (
                  <p>
                    Detailed project information is not available.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* REPORT HEADER */}

            <div className="similarity-page-header">
              <h1>Project Analysis Report</h1>

              <button
                type="button"
                className="sd-primary"
                onClick={closeSimilarityReport}
              >
                ← Back to Dashboard
              </button>
            </div>

            <h2 className="faculty-similarity-project-title">
              {selectedProject.title || "Selected Project"}
            </h2>

            {similarityLoading && (
              <p className="faculty-message">
                Analyzing project...
              </p>
            )}

            {similarityError && (
              <p className="faculty-message error">
                {similarityError}
              </p>
            )}

            {statusMessage && (
              <p className="faculty-message">
                {statusMessage}
              </p>
            )}

            {statusError && (
              <p className="faculty-message error">
                {statusError}
              </p>
            )}

            {/* ======================================
                SIMILARITY ANALYSIS
            ====================================== */}

          

{similarityReport && (
  <div className="similarity-report-layout">
    <h2 className="similarity-project-heading">
      {similarityReport.analyzedProject?.title ||
        selectedProject.title ||
        "Selected Project"}
    </h2>

    <div className="similarity-three-columns">
      {/* COLUMN 1: OVERALL SIMILARITY */}
      <section className="similarity-overall-section">
        <h3>Overall Similarity</h3>

        <div className="similarity-circle-area">
          <div
            className="similarity-circle"
            style={{
              "--score": `${Math.min(
                100,
                Math.max(
                  0,
                  formatScore(similarityReport.overallSimilarity)
                )
              )}%`,
            }}
          >
            <div className="similarity-circle-inner">
              <strong>
                {similarityReport.overallSimilarity ?? 0}%
              </strong>
              <span>Similarity Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* COLUMN 2: CATEGORY-WISE SIMILARITY */}
      <section className="similarity-category-section">
        <h3>Category-wise Similarity</h3>

        {Object.entries(
          similarityReport.fieldScores || {}
        ).map(([field, score]) => (
          <div className="similarity-field" key={field}>
            <div className="similarity-field-header">
              <span>
                {field.replace(/([A-Z])/g, " $1")}
              </span>
              <strong>{score}%</strong>
            </div>

            <div className="similarity-track">
              <div
                className="similarity-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, formatScore(score))
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* COLUMN 3: TOP 5 SIMILAR PROJECTS */}
      <section className="similarity-matches-card">
        <h3>Top 5 Similar Projects</h3>

        {similarityReport.matchingProjects?.length > 0 ? (
          similarityReport.matchingProjects
            .slice(0, 5)
            .map((match, index) => (
              <article
                className="similarity-match-row"
                key={
                  match.projectId ||
                  match.projectTitle ||
                  index
                }
              >
                <div className="similarity-match-main">
                  <span className="similarity-match-number">
                    {index + 1}
                  </span>

                  <div className="similarity-match-info">
                    <h3>
                      {match.projectTitle ||
                        match.title ||
                        "Untitled Project"}
                    </h3>

                    {match.domain && (
                      <span className="similarity-match-domain">
                        {match.domain}
                      </span>
                    )}
                  </div>
                </div>

                <div className="similarity-match-actions">
                  <strong className="similarity-score">
                    {match.overallSimilarity ?? 0}%
                  </strong>

                  <button
                    type="button"
                    className="similarity-view-button"
                    onClick={() => setSelectedMatch(match)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))
        ) : (
          <p>No matching projects found.</p>
        )}
      </section>
    </div>

    {/* FACULTY APPROVE / REJECT BUTTONS */}
    <div
      className="similarity-faculty-decision-area"
      style={{
        padding: "16px 24px 24px",
        borderTop: "1px solid #e1e7f5",
      }}
    >
      <div className="similarity-decision-buttons">
        <button
          type="button"
          className="similarity-approve-btn"
          disabled={
            statusUpdating ||
            statusOf(selectedProject) !== "Pending"
          }
          onClick={() => updateProjectStatus("Approved")}
        >
          {statusUpdating ? "Updating..." : "✓ Approve"}
        </button>

        <button
          type="button"
          className="similarity-reject-btn"
          disabled={
            statusUpdating ||
            statusOf(selectedProject) !== "Pending"
          }
          onClick={() => updateProjectStatus("Rejected")}
        >
          {statusUpdating ? "Updating..." : "✕ Reject"}
        </button>
      </div>

      {statusOf(selectedProject) !== "Pending" && (
        <p className="similarity-reviewed-status">
          This project has already been{" "}
          {statusOf(selectedProject).toLowerCase()}.
        </p>
      )}
    </div>
  </div>
)}


            {/* ======================================
                NOVELTY + DIFFERENTIATION
                BOTH INSIDE SAME GRID
            ====================================== */}

            {similarityReport && (
              <div className="analysis-bottom-grid">

                {/* ==================================
                    NOVELTY ANALYSIS - LEFT
                ================================== */}

                <section className="novelty-analysis-card">
                  <h2>💡 Novelty Analysis</h2>

                  {novelty ? (
                    <div className="novelty-content">

                      {/* NOVELTY CIRCLE */}

                      <div className="novelty-score-section">
                        <h3>Novelty Score</h3>

                        <div
                          className="novelty-circle"
                          style={{
                            "--novelty-score": `${noveltyScore}%`,
                          }}
                        >
                          <div className="novelty-circle-inner">
                            <span className="novelty-level">
                              {novelty.noveltyLevel || "N/A"}
                            </span>

                            <span className="novelty-percentage">
                              {novelty.noveltyScore == null
                                ? "N/A"
                                : `${novelty.noveltyScore}%`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* UNIQUE FEATURES */}

                      <div className="novelty-features-section">
                        <h3>Newly Identified Features</h3>

                        <div className="novelty-feature-list">
                          {novelty.uniqueFeatures?.length > 0 ? (
                            novelty.uniqueFeatures.map(
                              (feature, index) => (
                                <div
                                  className="novelty-feature-item"
                                  key={index}
                                >
                                  <span className="novelty-feature-icon">
                                    ✓
                                  </span>

                                  <span>{feature}</span>
                                </div>
                              )
                            )
                          ) : (
                            <div className="novelty-feature-item">
                              No unique features identified.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="novelty-content">
                      <p>
                        Novelty analysis result is not available.
                      </p>
                    </div>
                  )}
                </section>

                {/* ==================================
                    DIFFERENTIATION ANALYSIS - RIGHT
                ================================== */}

                <section className="differentiation-analysis-card">
                  <h2>🔍 Differentiation Analysis</h2>

                  {differentiation?.mostSimilarProject ? (
                    <div className="differentiation-content">

                      <h3 className="differentiation-subtitle">
                        Comparison with Highest Matching Project
                      </h3>

                      {/* PROJECT VS PROJECT */}

                      <div className="differentiation-projects">

                        <div className="differentiation-project-box">
                          <small>Submitted Project</small>

                          <strong>
                            {similarityReport.analyzedProject?.title ||
                              selectedProject?.title ||
                              "Selected Project"}
                          </strong>
                        </div>

                        <div className="differentiation-vs">
                          VS
                        </div>

                        <div className="differentiation-project-box match">
                          <small>Highest Matching Project</small>

                          <strong>
                            {
                              differentiation.mostSimilarProject
                                .projectTitle
                            }
                          </strong>

                          <small>
                            Similarity:{" "}
                            {
                              differentiation.mostSimilarProject
                                .overallSimilarity
                            }%
                          </small>
                        </div>
                      </div>

                      {/* FEATURE COMPARISON TABLE */}

                      <div className="differentiation-comparison">

                        {/* COMMON FEATURES */}

                        <div className="differentiation-row">
                          <div className="differentiation-row-label common">
                            ✓ Common Features
                          </div>

                          <div className="differentiation-row-value">
                            {differentiation.commonFeatures?.length > 0
                              ? differentiation.commonFeatures.join(", ")
                              : "No common features found."}
                          </div>
                        </div>

                        {/* ADDITIONAL FEATURES */}

                        <div className="differentiation-row">
                          <div className="differentiation-row-label additional">
                            + Additional Features
                          </div>

                          <div className="differentiation-row-value">
                            {differentiation.additionalFeatures?.length > 0
                              ? differentiation.additionalFeatures.join(", ")
                              : "No additional features found."}
                          </div>
                        </div>

                        {/* DIFFERENT FEATURES */}

                        <div className="differentiation-row">
                          <div className="differentiation-row-label different">
                            ⇄ Different Features
                          </div>

                          <div className="differentiation-row-value">
                            {differentiation.differentFeatures?.length > 0
                              ? differentiation.differentFeatures.join(", ")
                              : "No different features found."}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="differentiation-content">
                      <p>
                        Differentiation analysis result is not available.
                      </p>
                    </div>
                  )}
                </section>

              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // MAIN FACULTY DASHBOARD
  // ==========================================

  return (
    <div className="faculty-layout">
      <header className="faculty-topbar">
        <div className="faculty-header-brand">
          🎓 Project Similarity Analyzer
        </div>

        <div className="faculty-user">
          <span className="faculty-avatar">F</span>

          <div>
            <strong>{facultyName}</strong>
            <small>Faculty</small>
          </div>
        </div>
      </header>

      <aside className="faculty-sidebar">
        <nav className="faculty-nav">
          {[
            "Dashboard",
            "View Projects",
            "My Reviews",
            "Profile",
          ].map((item) => (
            <button
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => setActivePage(item)}
            >
              {item === "Dashboard" && "⌂"}
              {item === "View Projects" && "▤"}
              {item === "My Reviews" && "☑"}
              {item === "Profile" && "♙"}
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <button
          className="faculty-logout"
          onClick={onLogout}
        >
          ⇥ <span>Logout</span>
        </button>
      </aside>

      <main className="faculty-main">
        <section className="faculty-welcome">
          <h2>Welcome, {facultyName}!</h2>

          <p>
            Review and manage student-submitted projects.
          </p>
        </section>

        {/* PROJECT STATUS CARDS */}

        {(activePage === "Dashboard" ||
          activePage === "My Reviews") && (
          <section className="faculty-stats">

            <div className="faculty-stat total">
              <span>▤</span>
              <div>
                <p>Total Projects</p>
                <h2>{projects.length}</h2>
                <small>All student submissions</small>
              </div>
            </div>

            <div className="faculty-stat pending">
              <span>◷</span>
              <div>
                <p>Pending Review</p>
                <h2>{pending}</h2>
                <small>Awaiting your decision</small>
              </div>
            </div>

            <div className="faculty-stat approved">
              <span>✓</span>
              <div>
                <p>Approved</p>
                <h2>{approved}</h2>
                <small>Successfully approved</small>
              </div>
            </div>

            <div className="faculty-stat rejected">
              <span>×</span>
              <div>
                <p>Rejected</p>
                <h2>{rejected}</h2>
                <small>Not approved</small>
              </div>
            </div>

          </section>
        )}

        {/* STUDENT PROJECTS TABLE */}

        {(activePage === "Dashboard" ||
          activePage === "View Projects") && (
          <section className="faculty-project-panel">
            <div className="faculty-project-heading">
              <h2>
                {activePage === "Dashboard"
                  ? "Submitted Projects"
                  : "All Student Projects"}
              </h2>

              <div className="faculty-filters">
                <input
                  type="text"
                  placeholder="Search project or register number..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="faculty-message">
                Loading projects...
              </p>
            ) : error ? (
              <p className="faculty-message error">
                {error}
              </p>
            ) : (
              <div className="faculty-table-wrap">
                <table className="faculty-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Project Title</th>
                      <th>Student Name</th>
                      <th>Register No.</th>
                      <th>Domain</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProjects.map((project, index) => (
                      <tr key={project._id || index}>
                        <td>{index + 1}</td>
                        <td>{project.title}</td>
                        <td>{project.studentName || "—"}</td>
                        <td>
                          {project.studentRegisterNumber || "—"}
                        </td>
                        <td>{project.domain || "—"}</td>

                        <td>
                          <span
                            className={
                              "faculty-status " +
                              statusOf(project).toLowerCase()
                            }
                          >
                            {statusOf(project)}
                          </span>
                        </td>

                        <td>
                          <button
                            className="faculty-view-btn"
                            onClick={() => {
                              const features = Array.isArray(
                                project.mainFeatures
                              )
                                ? project.mainFeatures.join(", ")
                                : project.mainFeatures || "—";

                              window.alert(
                                "Project: " +
                                  project.title +
                                  "\n\nAbstract: " +
                                  (project.abstract || "—") +
                                  "\n\nProblem: " +
                                  (project.problemStatement || "—") +
                                  "\n\nFeatures: " +
                                  features
                              );
                            }}
                          >
                            View Details
                          </button>

                          <button
                            className="faculty-view-btn"
                            onClick={() =>
                              runSimilarityAnalysis(project)
                            }
                            disabled={similarityLoading}
                          >
                            Project Analysis
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredProjects.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="faculty-empty"
                        >
                          No student projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
