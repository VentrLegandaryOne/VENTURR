import { useAuth } from "@/_core/hooks/useAuth";
import { VenturrLogoWithText } from "@/components/VenturrLogo";
import { useLocation } from "wouter";
import "../styles/minimal-design.css";

export default function HomeMinimal() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleEnter = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <header className="minimal-header">
        <VenturrLogoWithText size="md" />
      </header>

      {/* Main Content */}
      <main style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "var(--space-6)"
      }}>
        <div className="minimal-card" style={{ 
          maxWidth: "600px", 
          textAlign: "center",
          padding: "var(--space-8)"
        }}>
          {/* Headline */}
          <h1 className="minimal-heading-1" style={{ marginBottom: "var(--space-3)" }}>
            Measure once.<br />
            Quote correctly.<br />
            On sight.
          </h1>

          {/* Sub-text */}
          <p className="minimal-text-muted" style={{ 
            fontSize: "1.125rem",
            marginBottom: "var(--space-6)",
            lineHeight: "1.6"
          }}>
            Venturr is your quoting and documentation engine.<br />
            From satellite measurement to professional quotes,<br />
            all in one seamless workflow.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleEnter}
            disabled={loading}
            className="minimal-button-primary"
            style={{
              fontSize: "1.125rem",
              padding: "var(--space-3) var(--space-6)",
              width: "100%",
              maxWidth: "300px"
            }}
          >
            {loading ? "Loading..." : isAuthenticated ? "Go to Dashboard" : "Enter Venturr OS"}
          </button>

          {/* Features */}
          <div style={{ 
            marginTop: "var(--space-8)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-4)",
            textAlign: "center"
          }}>
            <div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "600",
                color: "var(--venturr-blue)",
                marginBottom: "var(--space-1)"
              }}>
                1
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
                Measure
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "600",
                color: "var(--venturr-blue)",
                marginBottom: "var(--space-1)"
              }}>
                2
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
                Calculate
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "600",
                color: "var(--venturr-blue)",
                marginBottom: "var(--space-1)"
              }}>
                3
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
                Quote
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

