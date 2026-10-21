import React from "react";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  return (
    <div className="admin-layout">
    

<header className="admin-topbar">
  <h2 className="admin-header-brand">
    <span className="admin-cap">🎓</span>
    Project Similarity Analyzer
  </h2>

  <div className="admin-user">
    <div className="admin-avatar">A</div>
    <div>
      <strong>Admin</strong>
      <small>Administrator</small>
    </div>
  </div>
</header>



      <aside className="admin-sidebar">
       
<nav className="admin-nav">
  <button
    className="active"
    onClick={() => document.getElementById("dashboard")?.scrollIntoView()}
  >
    <span>🏠</span> Dashboard
  </button>

  <button onClick={() => document.getElementById("students")?.scrollIntoView()}>
    <span>🎓</span> Manage Students
  </button>

  <button onClick={() => document.getElementById("faculty")?.scrollIntoView()}>
    <span>👩‍🏫</span> Manage Faculty
  </button>

  <button onClick={() => document.getElementById("projects")?.scrollIntoView()}>
    <span>📁</span> All Projects
  </button>

  <button onClick={() => document.getElementById("reports")?.scrollIntoView()}>
    <span>📊</span> Similarity Reports
  </button>
</nav>

<button className="admin-logout" onClick={onLogout}>
  <span>🚪</span> Logout
</button>


      </aside>

      <main className="admin-main" id="dashboard">
        <section className="admin-welcome">
          <h2>Welcome, Admin!</h2>
          <p>Here is your project overview.</p>
        </section>

        <div className="admin-stats">
          <div className="admin-stat students">
            <div>
              <p>Total Students</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="admin-stat faculty">
            <div>
              <p>Total Faculty</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="admin-stat projects">
            <div>
              <p>Total Projects</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="admin-stat reports">
            <div>
              <p>Similarity Reports</p>
              <h2>0</h2>
            </div>
          </div>
        </div>

        <section className="admin-management">
          <h2 className="admin-management-heading">Admin Management</h2>
          <div className="admin-management-grid">
            <div className="admin-management-card" id="students">
              <h3>Manage Students</h3>
              <p>View and manage student details.</p>
              <button className="admin-action-btn">Manage Students</button>
            </div>
            <div className="admin-management-card" id="faculty">
              <h3>Manage Faculty</h3>
              <p>View and manage faculty details.</p>
              <button className="admin-action-btn">Manage Faculty</button>
            </div>
            <div className="admin-management-card" id="projects">
              <h3>All Projects</h3>
              <p>View submitted student projects.</p>
              <button className="admin-action-btn">View Projects</button>
            </div>
            <div className="admin-management-card" id="reports">
              <h3>Similarity Reports</h3>
              <p>Review project similarity results.</p>
              <button className="admin-action-btn">View Reports</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;