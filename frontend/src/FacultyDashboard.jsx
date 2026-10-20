
import { useEffect, useState } from "react";
import "./FacultyDashboard.css";

const API = "http://localhost:5000/api/projects";

export default function FacultyDashboard({
  faculty,
  onLogout,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      })
      .then((data) => {
        // Faculty should see all student-submitted projects.
        setProjects(data);
      })
      .catch(() => {
        setError("Projects load avvaledu. Backend check cheyyi.");
      })
      .finally(() => setLoading(false));
  }, []);

  const statusOf = (p) => p.status || "Pending";

  const pending = projects.filter(
    (p) => statusOf(p) === "Pending"
  ).length;

  const approved = projects.filter(
    (p) => statusOf(p) === "Approved"
  ).length;

  const rejected = projects.filter(
    (p) => statusOf(p) === "Rejected"
  ).length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.studentRegisterNumber || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      statusOf(p) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const facultyName =
    faculty?.name || faculty?.facultyId || "Faculty";

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
          {["Dashboard", "View Projects", "My Reviews", "Profile"].map(
            (item) => (
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
            )
          )}
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

        {(activePage === "Dashboard" || activePage === "My Reviews") && (
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
              : activePage === "View Projects"
              ? "All Student Projects"
              : activePage === "My Reviews"
             ? "My Reviews"
             : "Faculty Profile"}
            </h2>

            <div className="faculty-filters">
              <input
                type="text"
                placeholder="Search project or register number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                          className={`faculty-status ${statusOf(project).toLowerCase()}`}
                        >
                          {statusOf(project)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="faculty-view-btn"
                          onClick={() => {
                            alert(
                              `Project: ${project.title}\n\nAbstract: ${project.abstract || "—"}\n\nProblem: ${project.problemStatement || "—"}\n\nFeatures: ${(project.mainFeatures || []).join(", ")}`
                            );
                          }}
                        >
                          View Details
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
