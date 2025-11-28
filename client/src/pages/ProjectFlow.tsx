import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { VenturrLogoWithText } from "@/components/VenturrLogo";
import { PillStepper } from "@/components/PillStepper";
import { trpc } from "@/lib/trpc";
import "../styles/minimal-design.css";

type Stage = "lead" | "measure" | "takeoff" | "quote";

export default function ProjectFlow() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentStage, setCurrentStage] = useState<Stage>("lead");

  // Fetch project data
  const { data: project } = trpc.projects.getById.useQuery(
    { id: params.id || "" },
    { enabled: !!params.id }
  );

  const steps = [
    { id: 1, label: "Lead", status: currentStage === "lead" ? "active" : "completed" as const },
    { id: 2, label: "Measure", status: currentStage === "measure" ? "active" : currentStage === "lead" ? "pending" : "completed" as const },
    { id: 3, label: "Take-off", status: currentStage === "takeoff" ? "active" : ["lead", "measure"].includes(currentStage) ? "pending" : "completed" as const },
    { id: 4, label: "Quote", status: currentStage === "quote" ? "active" : "pending" as const }
  ];

  const handleStepClick = (stepId: number) => {
    const stages: Stage[] = ["lead", "measure", "takeoff", "quote"];
    setCurrentStage(stages[stepId - 1]);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Sidebar */}
      <aside className="minimal-sidebar">
        <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)" }}>
          <VenturrLogoWithText size="md" />
        </div>
        
        <nav className="minimal-sidebar-nav">
          <a href="/dashboard" className="minimal-sidebar-item">
            Dashboard
          </a>
          <a href="/projects" className="minimal-sidebar-item active">
            Projects
          </a>
          <a href="/archive" className="minimal-sidebar-item">
            Archive
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="minimal-main">
        {/* Pill Stepper */}
        <PillStepper steps={steps} onStepClick={handleStepClick} />

        {/* Stage Content */}
        {currentStage === "lead" && <LeadStage project={project} />}
        {currentStage === "measure" && <MeasureStage project={project} />}
        {currentStage === "takeoff" && <TakeoffStage project={project} />}
        {currentStage === "quote" && <QuoteStage project={project} />}
      </main>
    </div>
  );
}

// Lead Stage Component
function LeadStage({ project }: { project: any }) {
  const [client, setClient] = useState(project?.clientName || "");
  const [address, setAddress] = useState(project?.address || "");
  const [scope, setScope] = useState(project?.description || "");

  return (
    <div className="minimal-card">
      <h2 className="minimal-heading-2" style={{ marginBottom: "var(--space-4)" }}>
        1. Lead Information
      </h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--space-1)",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--gray-700)"
          }}>
            Client Name
          </label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="minimal-input"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--space-1)",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--gray-700)"
          }}>
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="minimal-input"
            placeholder="22 Burrawan St, Port Macquarie NSW 2444"
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--space-1)",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--gray-700)"
          }}>
            Scope of Work
          </label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="minimal-input"
            placeholder="Roof replacement - Colorbond steel roofing"
            rows={4}
            style={{ resize: "vertical" }}
          />
        </div>

        <button className="minimal-button-primary" style={{ alignSelf: "flex-start" }}>
          Save & Continue
        </button>
      </div>
    </div>
  );
}

// Measure Stage Component
function MeasureStage({ project }: { project: any }) {
  return (
    <div className="minimal-card">
      <h2 className="minimal-heading-2" style={{ marginBottom: "var(--space-4)" }}>
        2. Site Measurement
      </h2>
      
      {/* Planes Table */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "var(--space-2)" }}>
          Roof Planes
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
              <th style={{ padding: "var(--space-2)", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Plane</th>
              <th style={{ padding: "var(--space-2)", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Length (m)</th>
              <th style={{ padding: "var(--space-2)", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Width (m)</th>
              <th style={{ padding: "var(--space-2)", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Area (m²)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <td style={{ padding: "var(--space-2)" }}>North</td>
              <td style={{ padding: "var(--space-2)" }}>
                <input type="number" className="minimal-input" placeholder="0" style={{ width: "80px" }} />
              </td>
              <td style={{ padding: "var(--space-2)" }}>
                <input type="number" className="minimal-input" placeholder="0" style={{ width: "80px" }} />
              </td>
              <td style={{ padding: "var(--space-2)", color: "var(--gray-600)" }}>0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Drawing Canvas Placeholder */}
      <div style={{ 
        background: "var(--gray-100)", 
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-8)",
        textAlign: "center",
        marginBottom: "var(--space-4)"
      }}>
        <p className="minimal-text-muted">Dot-draw canvas placeholder</p>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginTop: "var(--space-2)" }}>
          Click to add measurement points
        </p>
      </div>

      <button className="minimal-button-primary" style={{ alignSelf: "flex-start" }}>
        Save & Continue
      </button>
    </div>
  );
}

// Takeoff Stage Component
function TakeoffStage({ project }: { project: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-4)" }}>
      {/* Line Items */}
      <div className="minimal-card">
        <h2 className="minimal-heading-2" style={{ marginBottom: "var(--space-4)" }}>
          3. Take-off
        </h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
              <th style={{ padding: "var(--space-2)", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Item</th>
              <th style={{ padding: "var(--space-2)", textAlign: "right", fontSize: "0.875rem", fontWeight: "600" }}>Qty</th>
              <th style={{ padding: "var(--space-2)", textAlign: "right", fontSize: "0.875rem", fontWeight: "600" }}>Unit</th>
              <th style={{ padding: "var(--space-2)", textAlign: "right", fontSize: "0.875rem", fontWeight: "600" }}>Rate</th>
              <th style={{ padding: "var(--space-2)", textAlign: "right", fontSize: "0.875rem", fontWeight: "600" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <td style={{ padding: "var(--space-2)" }}>Colorbond Roofing</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>85</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>m²</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>$45.00</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right", fontWeight: "600" }}>$3,825.00</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <td style={{ padding: "var(--space-2)" }}>Sarking</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>85</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>m²</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right" }}>$12.00</td>
              <td style={{ padding: "var(--space-2)", textAlign: "right", fontWeight: "600" }}>$1,020.00</td>
            </tr>
          </tbody>
        </table>

        <button className="minimal-button-secondary" style={{ marginTop: "var(--space-4)" }}>
          + Add Line Item
        </button>
      </div>

      {/* Totals Summary */}
      <div className="minimal-card">
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "var(--space-4)" }}>
          Summary
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="minimal-text-muted">Subtotal</span>
            <span style={{ fontWeight: "600" }}>$4,845.00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="minimal-text-muted">Markup (25%)</span>
            <span style={{ fontWeight: "600" }}>$1,211.25</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="minimal-text-muted">GST (10%)</span>
            <span style={{ fontWeight: "600" }}>$605.63</span>
          </div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            paddingTop: "var(--space-2)",
            borderTop: "2px solid var(--gray-200)",
            marginTop: "var(--space-2)"
          }}>
            <span style={{ fontWeight: "600" }}>Total</span>
            <span style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--venturr-blue)" }}>
              $6,661.88
            </span>
          </div>
        </div>

        <button className="minimal-button-primary" style={{ width: "100%", marginTop: "var(--space-4)" }}>
          Continue to Quote
        </button>
      </div>
    </div>
  );
}

// Quote Stage Component
function QuoteStage({ project }: { project: any }) {
  return (
    <div className="minimal-card">
      <h2 className="minimal-heading-2" style={{ marginBottom: "var(--space-4)" }}>
        4. Quote
      </h2>
      
      {/* Quote Preview */}
      <div style={{ 
        background: "var(--white)", 
        border: "1px solid var(--gray-200)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        marginBottom: "var(--space-4)"
      }}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "var(--space-1)" }}>
            VENTURR ROOFING
          </h3>
          <p className="minimal-text-muted">Quote #Q-2025-001</p>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontWeight: "600", marginBottom: "var(--space-1)" }}>Client:</p>
          <p className="minimal-text-muted">John Smith</p>
          <p className="minimal-text-muted">22 Burrawan St, Port Macquarie NSW 2444</p>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontWeight: "600", marginBottom: "var(--space-1)" }}>Scope:</p>
          <p className="minimal-text-muted">Roof replacement - Colorbond steel roofing</p>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontWeight: "600", marginBottom: "var(--space-1)" }}>Inclusions:</p>
          <ul style={{ paddingLeft: "var(--space-4)", color: "var(--gray-600)" }}>
            <li>Colorbond roofing - 85m²</li>
            <li>Sarking installation</li>
            <li>All flashings and trims</li>
            <li>Site cleanup</li>
          </ul>
        </div>

        <div style={{ 
          paddingTop: "var(--space-4)",
          borderTop: "2px solid var(--gray-200)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "600" }}>Total:</span>
            <span style={{ fontSize: "2rem", fontWeight: "700", color: "var(--venturr-blue)" }}>
              $6,661.88
            </span>
          </div>
          <p className="minimal-text-muted" style={{ fontSize: "0.875rem", marginTop: "var(--space-1)" }}>
            (inc. GST)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button className="minimal-button-primary">
          Download PDF
        </button>
        <button className="minimal-button-secondary">
          Email to Client
        </button>
      </div>
    </div>
  );
}

