
import { useEffect, useState } from "react";
import "./StudentDashboard.css";
import "./SimilarityAnalysis.css";

const API = "http://localhost:5000/api/projects";
const SIMILARITY_API = "http://localhost:5000/api/similarity-analysis";

export default function StudentDashboard({
  student,
  onLogout,
  onSubmitProject,
  socket,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSimilarity, setShowSimilarity] = useState(false);
  const [similarityReport, setSimilarityReport] = useState(null);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarityError, setSimilarityError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetch(
      `${API}?registerNumber=${encodeURIComponent(
        student?.registerNumber || ""
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }
        return response.json();
      })
      .then((data) => {
        const studentProjects = Array.isArray(data)
          ? data.filter(
              (project) => project.projectType === "student"
            )
          : [];

        setProjects(studentProjects);
      })
      .catch((err) => {
        setError(
          err.message ||
            "Failed to load projects. Please check the backend."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [student?.registerNumber]);
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      const updatedProject = data?.project;

      if (!updatedProject) return;

      if (
        String(updatedProject.studentRegisterNumber) !==
        String(student?.registerNumber)
      ) {
        return;
      }

      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project._id === updatedProject._id
            ? { ...project, ...updatedProject }
            : project
        )
      );

      console.log("Project status updated:", updatedProject.status);
    };

    socket.on("projectStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("projectStatusUpdated", handleStatusUpdate);
    };
  }, [socket, student?.registerNumber]);
  const statusOf = (project) => project.status || "Pending";

  const pending = projects.filter(
    (project) => statusOf(project) === "Pending"
  ).length;

  const approved = projects.filter(
    (project) => statusOf(project) === "Approved"
  ).length;

  const rejected = projects.filter(
    (project) => statusOf(project) === "Rejected"
  ).length;

  const total = projects.length;

  const runSimilarityAnalysis = async (project) => {
    if (!project) {
      setShowSimilarity(true);
      setSimilarityReport(null);
      setSimilarityError("Project not found. Please try again.");
      return;
    }

    setShowSimilarity(true);
    setSelectedMatch(null);
    setSimilarityLoading(true);
    setSimilarityError("");
    setSimilarityReport(null);

    try {
      const response = await fetch(SIMILARITY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project._id,
          title: project.title || "",
          domain: project.domain || "",
          abstract: project.abstract || "",
          technologies: project.technologies || [],
          problemStatement: project.problemStatement || "",
          mainFeatures: project.mainFeatures || [],
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid server response (HTTP ${response.status}). Check the backend.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Similarity analysis failed (HTTP ${response.status}).`
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message || "Similarity analysis failed."
        );
      }

      console.log(
        "MATCHING PROJECT DATA:",
        data.matchingProjects?.[0]
      );

      setSimilarityReport(data);
    } catch (err) {
      setSimilarityError(
        err.message || "Unable to complete similarity analysis."
      );
    } finally {
      setSimilarityLoading(false);
    }
  };

  const name = student?.name || student?.username || "Student";

  const dateOf = (date) =>
    date ? new Date(date).toLocaleDateString("en-CA") : "—";

  const chartStyle = {
    background: total
      ? `conic-gradient(
          #f5ad2d 0deg ${(pending / total) * 360}deg,
          #20a36a ${(pending / total) * 360}deg ${
            ((pending + approved) / total) * 360
          }deg,
          #f14d67 ${
            ((pending + approved) / total) * 360
          }deg 360deg
        )`
      : "#e6edf5",
  };

  const getProjectDetail = (project, possibleKeys) => {
    for (const key of possibleKeys) {
      const rawValue = project?.[key];

      if (Array.isArray(rawValue)) {
        const value = rawValue
          .flat(Infinity)
          .map((item) => {
            if (typeof item === "string") {
              return item.trim();
            }

            if (item && typeof item === "object") {
              return item.name || item.title || "";
            }

            return String(item ?? "");
          })
          .filter(Boolean)
          .join(", ");

        if (value) return value;
      }

      if (typeof rawValue === "string") {
        const trimmed = rawValue.trim();

        try {
          const parsed = JSON.parse(trimmed);

          if (Array.isArray(parsed)) {
            const value = parsed
              .flat(Infinity)
              .map((item) =>
                typeof item === "object" && item !== null
                  ? item.name || item.title || ""
                  : String(item ?? "")
              )
              .filter(Boolean)
              .join(", ");

            if (value) return value;
          }
        } catch {
          // Normal string
        }

        if (trimmed) return trimmed;
      }
    }

    return "";
  };

  const projectDetailFields = [
    ["Abstract", ["abstract", "projectAbstract"]],
    ["Domain", ["domain"]],
    [
      "Problem Statement",
      ["problemStatement", "problem_statement"],
    ],
    ["Objectives", ["objectives", "projectObjectives"]],
    ["Methodology", ["methodology"]],
    [
      "Technologies",
      ["technologies", "techStack", "technology", "tech_stack"],
    ],
    [
      "Main Features",
      ["mainFeatures", "features", "main_features"],
    ],
    ["Keywords", ["keywords"]],
    ["Expected Outcome", ["expectedOutcome", "outcome"]],
  ];

  // =========================================
  // PROJECT ANALYSIS REPORT
  // =========================================

  if (showSimilarity) {
    return (
      <div className="student-dashboard">
        <main className="sd-main">
          <div className="sd-content">
            {selectedMatch ? (
              <>
                <div className="similarity-page-header">
                  <h1>Matching Project Details</h1>

                  <button
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
                      <p className="similarity-detail-empty">
                        Detailed information for this project
                        was not included in the similarity response.
                      </p>
                    )}

                    {selectedMatch.projectId && (
                      <p className="similarity-detail-id">
                        Project ID:{" "}
                        {String(selectedMatch.projectId)}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="similarity-page-header">
                  <h1>Project Analysis Report</h1>

                  <button
                    className="sd-primary"
                    onClick={() => {
                      setShowSimilarity(false);
                      setSelectedMatch(null);
                    }}
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                {similarityLoading && (
                  <p>Analyzing projects...</p>
                )}

                {similarityError && (
                  <div className="sd-error" role="alert">
                    {similarityError}
                  </div>
                )}

                {/* =====================================
                    SIMILARITY ANALYSIS
                ===================================== */}

      
{similarityReport && (
  <div className="similarity-report-layout">
    <h2 className="similarity-project-heading">
      {similarityReport.analyzedProject?.title ||
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
                  Number(similarityReport.overallSimilarity) || 0
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
                    Math.max(0, Number(score) || 0)
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
  </div>
)}



                {/* =====================================
                    NOVELTY + DIFFERENTIATION
                    BOTH INSIDE SAME GRID
                ===================================== */}

                {similarityReport && (
                 

<div className="analysis-bottom-grid">

  {/* ========== NOVELTY ANALYSIS ========== */}

  <section className="novelty-analysis-card">
    <h2>💡 Novelty Analysis</h2>

    {similarityReport.noveltyAnalysis ? (
      <div className="novelty-content">

        {/* NOVELTY SCORE CIRCLE */}

        <div className="novelty-score-section">
          <h3>Novelty Score</h3>

          <div
            className="novelty-circle"
            style={{
              "--novelty-score": `${
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      similarityReport.noveltyAnalysis.noveltyScore
                    ) || 0
                  )
                )
              }%`,
            }}
          >
            <div className="novelty-circle-inner">
              <span className="novelty-level">
                {similarityReport.noveltyAnalysis.noveltyLevel}
              </span>

              <span className="novelty-percentage">
                {similarityReport.noveltyAnalysis.noveltyScore == null
                  ? "N/A"
                  : `${similarityReport.noveltyAnalysis.noveltyScore}%`}
              </span>
            </div>
          </div>
        </div>

        {/* UNIQUE FEATURES */}

        <div className="novelty-features-section">
          <h3>Newly Identified Features</h3>

          <div className="novelty-feature-list">
            {similarityReport.noveltyAnalysis.uniqueFeatures?.length > 0 ? (
              similarityReport.noveltyAnalysis.uniqueFeatures.map(
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
        <p>Novelty analysis result is not available.</p>
      </div>
    )}
  </section>

  {/* ========== DIFFERENTIATION ANALYSIS ========== */}

  <section className="differentiation-analysis-card">
    <h2>🔍 Differentiation Analysis</h2>

    {similarityReport.differentiationAnalysis?.mostSimilarProject ? (
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
                similarityReport.differentiationAnalysis
                  .mostSimilarProject.projectTitle
              }
            </strong>

            <small>
              Similarity:{" "}
              {
                similarityReport.differentiationAnalysis
                  .mostSimilarProject.overallSimilarity
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
              {similarityReport.differentiationAnalysis.commonFeatures?.length > 0
                ? similarityReport.differentiationAnalysis.commonFeatures.join(", ")
                : "No common features found."}
            </div>
          </div>

          {/* ADDITIONAL FEATURES */}

          <div className="differentiation-row">
            <div className="differentiation-row-label additional">
              + Additional Features
            </div>

            <div className="differentiation-row-value">
              {similarityReport.differentiationAnalysis.additionalFeatures?.length > 0
                ? similarityReport.differentiationAnalysis.additionalFeatures.join(", ")
                : "No additional features found."}
            </div>
          </div>

          {/* DIFFERENT FEATURES */}

          <div className="differentiation-row">
            <div className="differentiation-row-label different">
              ⇄ Different Features
            </div>

            <div className="differentiation-row-value">
              {similarityReport.differentiationAnalysis.differentFeatures?.length > 0
                ? similarityReport.differentiationAnalysis.differentFeatures.join(", ")
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
        </main>
      </div>
    );
  }

  // =========================================
  // NORMAL STUDENT DASHBOARD
  // =========================================

  return (
    <div className="student-dashboard">
      <header className="sd-topbar">
        <div className="sd-topbar-brand">
          🎓 Project Similarity Analyzer
        </div>

        <div className="sd-user" id="profile">
          <div className="sd-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="sd-user-info">
            <strong>{name}</strong>
            <span>Student</span>
          </div>

          <span>⌄</span>
        </div>
      </header>

      <aside className="sd-sidebar">
        <div className="sd-brand">
          <span className="sd-cap">🎓</span>
          <span>Project Similarity Analyzer</span>
        </div>

        <nav className="sd-nav">
          <a
            className="sd-nav-link selected"
            href="#dashboard"
          >
            <span>⌂</span> Dashboard
          </a>

          <a className="sd-nav-link" href="#submit">
            <span>▤</span> Submit Project
          </a>

          <a
            className="sd-nav-link"
            href="#my-projects"
          >
            <span>▤</span> My Projects
          </a>

          <a className="sd-nav-link" href="#profile">
            <span>♙</span> Profile
          </a>
        </nav>

        <button
          className="sd-logout"
          onClick={onLogout}
        >
          ⇥ <span>Logout</span>
        </button>
      </aside>

      <main className="sd-main" id="dashboard">
        <div className="sd-content">
          {/* WELCOME SECTION */}

          <section className="sd-welcome">
            <div>
              <h1>
                <span>👋</span> Welcome, {name}!
              </h1>

              <p>
                Here is an overview of your project
                submissions and their status.
              </p>
            </div>

            <blockquote>
              Great ideas start with
              <br />
              a single step. Keep going!
            </blockquote>
          </section>

          {error && (
            <div className="sd-error">
              {error}
            </div>
          )}

          {/* PROJECT STATUS CARDS */}

          <section className="sd-stats">
            <article className="sd-stat sd-stat-blue">
              <div className="sd-stat-icon">
                ➤
              </div>

              <div>
                <label>Total Submitted</label>
                <strong>
                  {loading ? "—" : total}
                </strong>
                <small>
                  Projects submitted so far
                </small>
              </div>
            </article>

            <article className="sd-stat sd-stat-yellow">
              <div className="sd-stat-icon">
                ◷
              </div>

              <div>
                <label>Pending</label>
                <strong>
                  {loading ? "—" : pending}
                </strong>
                <small>
                  Awaiting faculty review
                </small>
              </div>
            </article>

            <article className="sd-stat sd-stat-green">
              <div className="sd-stat-icon">
                ✓
              </div>

              <div>
                <label>Approved</label>
                <strong>
                  {loading ? "—" : approved}
                </strong>
                <small>
                  Successfully approved
                </small>
              </div>
            </article>

            <article className="sd-stat sd-stat-red">
              <div className="sd-stat-icon">
                ×
              </div>

              <div>
                <label>Rejected</label>
                <strong>
                  {loading ? "—" : rejected}
                </strong>
                <small>
                  Not approved
                </small>
              </div>
            </article>
          </section>

          {/* SUBMIT PROJECT + CHART */}

          <section className="sd-middle">
            <article
              className="sd-submit-card"
              id="submit"
            >
              <div
                className="sd-illustration"
                aria-hidden="true"
              >
                <div className="sd-paper">
                  📝
                  <span>▰ ▰ ▰</span>
                  <span>▰ ▰</span>
                </div>

                <div className="sd-plant">
                  🌿
                </div>

                <div className="sd-laptop">
                  💻
                </div>
              </div>

              <div className="sd-submit-copy">
                <h2>Submit New Project</h2>

                <p>
                  Enter your project details,
                  including title, abstract,
                  domain, keywords, and more.
                </p>

                <button
                  className="sd-primary"
                  onClick={onSubmitProject}
                >
                  ➤ &nbsp; Submit Project &nbsp; →
                </button>
              </div>
            </article>

            <article className="sd-chart-card">
              <h2>My Project Status</h2>

              <div className="sd-chart-layout">
                <div
                  className="sd-donut"
                  style={chartStyle}
                >
                  <div className="sd-donut-hole">
                    <strong>
                      {loading ? "—" : total}
                    </strong>
                    <span>Total Projects</span>
                  </div>
                </div>

                <div className="sd-legend">
                  <div>
                    <i className="sd-dot dot-pending" />
                    Pending
                    <strong>{pending}</strong>
                  </div>

                  <div>
                    <i className="sd-dot dot-approved" />
                    Approved
                    <strong>{approved}</strong>
                  </div>

                  <div>
                    <i className="sd-dot dot-rejected" />
                    Rejected
                    <strong>{rejected}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* MY SUBMITTED PROJECTS */}

          <section
            className="sd-projects-card"
            id="my-projects"
          >
            <div className="sd-table-heading">
              <h2>My Submitted Projects</h2>

              <a href="#my-projects">
                View All →
              </a>
            </div>

            {loading ? (
              <p className="sd-empty">
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <p className="sd-empty">
                No projects submitted yet.
              </p>
            ) : (
              <div className="sd-table-scroll">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Project Title</th>
                      <th>Domain</th>
                      <th>Technologies</th>
                      <th>Submitted On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map(
                      (project, index) => {
                        const status =
                          statusOf(project);

                        const keywords = [
                          ...(Array.isArray(
                            project.technologies
                          )
                            ? project.technologies
                            : []),

                          ...(Array.isArray(
                            project.mainFeatures
                          )
                            ? project.mainFeatures
                            : []),
                        ].slice(0, 3);

                        return (
                          <tr
                            key={
                              project._id || index
                            }
                          >
                            <td>
                              {index + 1}
                            </td>

                            <td className="sd-title">
                              {project.title}
                            </td>

                            <td>
                              {project.domain ||
                                "—"}
                            </td>

                            <td>
                              <div className="sd-keywords">
                                {keywords.map(
                                  (
                                    keyword,
                                    keywordIndex
                                  ) => (
                                    <span
                                      key={
                                        keywordIndex
                                      }
                                    >
                                      {keyword}
                                    </span>
                                  )
                                )}
                              </div>
                            </td>

                            <td>
                              {dateOf(
                                project.createdAt
                              )}
                            </td>

                            <td>
                              <span
                                className={`sd-status sd-${status.toLowerCase()}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="sd-view"
                                onClick={() =>
                                  window.alert(
                                    `${project.title}\n\n${
                                      project.abstract ||
                                      ""
                                    }`
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                className="sd-primary"
                                onClick={() =>
                                  runSimilarityAnalysis(
                                    project
                                  )
                                }
                                disabled={
                                  similarityLoading
                                }
                              >
                                Project Analysis
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
