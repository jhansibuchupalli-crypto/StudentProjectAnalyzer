
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

const getProjectDetail = (project, possibleKeys) => {
  for (const key of possibleKeys) {
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

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

export default function FacultyDashboard({ faculty, onLogout }) {
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
        throw new Error("Failed to load projects");
      }

      const data = await response.json();
      setProjects(data);
      setError("");
    } catch {
      setError("Projects load avvaledu. Backend check cheyyi.");
    } finally {
      setLoading(false);
    }
  };

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
          data.message || "Similarity analysis failed."
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
        API + "/" + selectedProject._id + "/status",
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

      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project._id === updatedProject._id
            ? { ...project, ...updatedProject }
            : project
        )
      );

      setSelectedProject((previousProject) =>
        previousProject?._id === updatedProject._id
          ? { ...previousProject, ...updatedProject }
          : previousProject
      );

      setStatusMessage("Project " + status + " successfully!");
    } catch (err) {
      setStatusError(
        err.message || "Status update failed. Backend check cheyyi."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  // Similarity Analysis page
  if (selectedProject) {
    return (
      <div className="faculty-similarity-page">
        {selectedMatch ? (
          <>
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
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="similarity-page-header">
              <h1>Similarity Analysis Report</h1>

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
                Analyzing project similarity...
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

            {similarityReport && (
              <div className="similarity-report-layout">
                <section className="similarity-left-panel">
                  <article className="similarity-selected-card">
                    <h2>
                      {similarityReport.analyzedProject?.title ||
                        selectedProject.title ||
                        "Selected Project"}
                    </h2>

                    <div className="similarity-left-content">
                      <div className="similarity-overall-section">
                        <h3>Overall Similarity</h3>

                        <div className="similarity-circle-area">
                          <div
                            className="similarity-circle"
                            style={{
                              "--score":
                                String(
                                  Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        similarityReport.overallSimilarity
                                      ) || 0
                                    )
                                  )
                                ) + "%",
                            }}
                          >
                            <div className="similarity-circle-inner">
                              <strong>
                                {similarityReport.overallSimilarity ?? 0}%
                              </strong>
                              <span>Overall Score</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="similarity-category-section">
                        <h3>Category-wise Similarity</h3>

                        {Object.entries(
                          similarityReport.fieldScores || {}
                        ).map(([field, score]) => (
                          <div
                            className="similarity-field"
                            key={field}
                          >
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
                                  width:
                                    String(
                                      Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          Number(score) || 0
                                        )
                                      )
                                    ) + "%",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="similarity-decision-buttons">
                      <button
                        type="button"
                        className="similarity-approve-btn"
                        disabled={
                          statusUpdating ||
                          statusOf(selectedProject) !== "Pending"
                        }
                        onClick={() =>
                          updateProjectStatus("Approved")
                        }
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
                        onClick={() =>
                          updateProjectStatus("Rejected")
                        }
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
                  </article>
                </section>

                <section className="similarity-matches-card">
                  <h2>Top Matching Projects</h2>

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
                          <div>
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
            )}
          </>
        )}
      </div>
    );
  }

  // Main Faculty Dashboard
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

        <button className="faculty-logout" onClick={onLogout}>
          ⇥ <span>Logout</span>
        </button>
      </aside>

      <main className="faculty-main">
        <section className="faculty-welcome">
          <h2>Welcome, {facultyName}!</h2>
          <p>Review and manage student-submitted projects.</p>
        </section>

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
              <p className="faculty-message">Loading projects...</p>
            ) : error ? (
              <p className="faculty-message error">{error}</p>
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
                      <tr key={project._id}>
                        <td>{index + 1}</td>
                        <td>{project.title}</td>
                        <td>{project.studentName || "—"}</td>
                        <td>{project.studentRegisterNumber || "—"}</td>
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
                            disabled={
                              similarityLoading &&
                              selectedProject?._id === project._id
                            }
                          >
                            Similarity Analysis
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan="7" className="faculty-empty">
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