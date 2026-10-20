
import { useEffect, useState } from "react";
import "./StudentDashboard.css";

const API = "http://localhost:5000/api/projects";

export default function StudentDashboard({ student, onLogout, onSubmitProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  fetch(
  `${API}?registerNumber=${encodeURIComponent(student.registerNumber)}`
)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    })
    .then((data) => {
      const studentProjects = data.filter(
        (p) => p.projectType === "student"
      );

      setProjects(studentProjects);
    })
    .catch(() => setError("Projects load avvaledu. Backend check cheyyi."))
    .finally(() => setLoading(false));
}, []);

  const statusOf = (p) => p.status || "Pending";
  const pending = projects.filter(p => statusOf(p) === "Pending").length;
  const approved = projects.filter(p => statusOf(p) === "Approved").length;
  const rejected = projects.filter(p => statusOf(p) === "Rejected").length;
  const total = projects.length;

  const name = student?.name || student?.username || "Student";

  const dateOf = (date) => date
    ? new Date(date).toLocaleDateString("en-CA")
    : "—";

  const chartStyle = {
    background: total
      ? `conic-gradient(
          #f5ad2d 0deg ${(pending / total) * 360}deg,
          #20a36a ${(pending / total) * 360}deg ${((pending + approved) / total) * 360}deg,
          #f14d67 ${((pending + approved) / total) * 360}deg 360deg
        )`
      : "#e6edf5"
  };

  return (
    <div className="student-dashboard">
        <header className="sd-topbar">
  <div className="sd-topbar-brand">🎓 Project Similarity Analyzer</div>
  <div className="sd-user" id="profile">
    <div className="sd-avatar">{name.charAt(0).toUpperCase()}</div>
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
          <a className="sd-nav-link selected" href="#dashboard"><span>⌂</span>Dashboard</a>
          <a className="sd-nav-link" href="#submit"><span>▤</span>Submit Project</a>
          <a className="sd-nav-link" href="#my-projects"><span>▤</span>My Projects</a>
          <a className="sd-nav-link" href="#profile"><span>♙</span>Profile</a>
        </nav>

        <button className="sd-logout" onClick={onLogout}>
          ⇥ <span>Logout</span>
        </button>
      </aside>

      <main className="sd-main" id="dashboard">
       

        <div className="sd-content">
          <section className="sd-welcome">
            <div>
              <h1><span>👋</span> Welcome, {name}!</h1>
              <p>Here's an overview of your project submissions and their status.</p>
            </div>
            <blockquote>“Great ideas start with<br />a single step. Keep going!”</blockquote>
          </section>

          {error && <div className="sd-error">{error}</div>}

          <section className="sd-stats">
            <article className="sd-stat sd-stat-blue">
              <div className="sd-stat-icon">➤</div>
              <div><label>Total Submitted</label><strong>{loading ? "—" : total}</strong><small>Projects submitted so far</small></div>
            </article>
            <article className="sd-stat sd-stat-yellow">
              <div className="sd-stat-icon">◷</div>
              <div><label>Pending</label><strong>{loading ? "—" : pending}</strong><small>Awaiting faculty review</small></div>
            </article>
            <article className="sd-stat sd-stat-green">
              <div className="sd-stat-icon">✓</div>
              <div><label>Approved</label><strong>{loading ? "—" : approved}</strong><small>Successfully approved</small></div>
            </article>
            <article className="sd-stat sd-stat-red">
              <div className="sd-stat-icon">×</div>
              <div><label>Rejected</label><strong>{loading ? "—" : rejected}</strong><small>Not approved</small></div>
            </article>
          </section>

          <section className="sd-middle">
            <article className="sd-submit-card" id="submit">
              <div className="sd-illustration" aria-hidden="true">
                <div className="sd-paper">📝<span>▰ ▰ ▰</span><span>▰ ▰</span></div>
                <div className="sd-plant">🌿</div>
                <div className="sd-laptop">💻</div>
              </div>
              <div className="sd-submit-copy">
                <h2>Submit New Project</h2>
                <p>Fill in your project details including title, abstract, domain, keywords and more.</p>
                <button className="sd-primary" onClick={onSubmitProject}>➤ &nbsp; Submit Project &nbsp; →</button>
              </div>
            </article>

            <article className="sd-chart-card">
              <h2>My Project Status</h2>
              <div className="sd-chart-layout">
                <div className="sd-donut" style={chartStyle}>
                  <div className="sd-donut-hole">
                    <strong>{loading ? "—" : total}</strong>
                    <span>Total Projects</span>
                  </div>
                </div>
                <div className="sd-legend">
                  <div><i className="sd-dot dot-pending" />Pending<strong>{pending}</strong></div>
                  <div><i className="sd-dot dot-approved" />Approved<strong>{approved}</strong></div>
                  <div><i className="sd-dot dot-rejected" />Rejected<strong>{rejected}</strong></div>
                </div>
              </div>
            </article>
          </section>

          <section className="sd-projects-card" id="my-projects">
            <div className="sd-table-heading">
              <h2>My Submitted Projects</h2>
              <a href="#my-projects">View All →</a>
            </div>

            {loading ? <p className="sd-empty">Loading projects...</p> :
              projects.length === 0 ? <p className="sd-empty">No projects submitted yet.</p> :
              <div className="sd-table-scroll">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Project Title</th><th>Domain</th>
                      <th>Technologies</th><th>Submitted On</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => {
                      const status = statusOf(p);
                      const keywords = [
                        ...(p.technologies || []),
                        ...(p.mainFeatures || [])
                      ].slice(0, 3);

                      return (
                        <tr key={p._id || i}>
                          <td>{i + 1}</td>
                          <td className="sd-title">{p.title}</td>
                          <td>{p.domain || "—"}</td>
                          <td><div className="sd-keywords">
                            {keywords.map((k, j) => <span key={j}>{k}</span>)}
                          </div></td>
                          <td>{dateOf(p.createdAt)}</td>
                          <td><span className={`sd-status sd-${status.toLowerCase()}`}>{status}</span></td>
                          <td><button className="sd-view" onClick={() => window.alert(`${p.title}\n\n${p.abstract || ""}`)}>View</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
          </section>
        </div>
      </main>
    </div>
  );
}
