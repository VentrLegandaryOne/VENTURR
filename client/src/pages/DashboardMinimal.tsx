import { useAuth } from "@/_core/hooks/useAuth";
import { VenturrLogoWithText } from "@/components/VenturrLogo";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import "../styles/minimal-design.css";

export default function DashboardMinimal() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    setLocation("/");
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Sidebar */}
      <aside className="minimal-sidebar">
        <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)" }}>
          <VenturrLogoWithText size="md" />
        </div>
        
        <nav className="minimal-sidebar-nav">
          <a href="/dashboard" className="minimal-sidebar-item active">
            Dashboard
          </a>
          <a href="/projects" className="minimal-sidebar-item">
            Projects
          </a>
          <a href="/archive" className="minimal-sidebar-item">
            Archive
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="minimal-main">
        {/* Header */}
        <header style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "var(--space-2)"
          }}>
            <div>
              <h1 className="minimal-heading-2">Dashboard</h1>
              <p className="minimal-text-muted">
                Start where it matters: leads, measures, and quotes.
              </p>
            </div>
            <button
              onClick={() => setLocation("/projects/new")}
              className="minimal-button-primary"
            >
              + New Project
            </button>
          </div>
        </header>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <p className="minimal-text-muted">Loading projects...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <h3 style={{ 
                  fontSize: "1.125rem", 
                  fontWeight: "600",
                  marginBottom: "var(--space-1)",
                  color: "var(--gray-900)"
                }}>
                  {project.address || "Untitled Project"}
                </h3>
                <p className="minimal-text-muted" style={{ fontSize: "0.875rem" }}>
                  {project.description || "No description"}
                </p>
                <div style={{ 
                  marginTop: "var(--space-3)",
                  paddingTop: "var(--space-3)",
                  borderTop: "1px solid var(--gray-100)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--gray-500)"
                }}>
                  <span>{project.status || "Draft"}</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="minimal-card" style={{ 
            textAlign: "center", 
            padding: "var(--space-8)" 
          }}>
            <h3 className="minimal-heading-3">No projects yet</h3>
            <p className="minimal-text-muted" style={{ marginBottom: "var(--space-4)" }}>
              Create your first project to get started
            </p>
            <button
              onClick={() => setLocation("/projects/new")}
              className="minimal-button-primary"
            >
              Create Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

