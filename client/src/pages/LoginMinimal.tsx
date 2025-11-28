import { useState } from "react";
import { useLocation } from "wouter";
import { VenturrLogo } from "@/components/VenturrLogo";
import "../styles/minimal-design.css";

export default function LoginMinimal() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the simple-signin API
      const response = await fetch("/api/auth/simple-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        // Redirect to dashboard
        setLocation("/dashboard");
      } else {
        alert("Sign in failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--gray-50)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-4)"
    }}>
      <div className="minimal-card" style={{ 
        maxWidth: "400px", 
        width: "100%",
        padding: "var(--space-8)"
      }}>
        {/* Logo */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginBottom: "var(--space-6)" 
        }}>
          <VenturrLogo size={48} />
        </div>

        {/* Heading */}
        <h1 className="minimal-heading-2" style={{ 
          textAlign: "center",
          marginBottom: "var(--space-6)"
        }}>
          Sign in
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "var(--space-1)",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "var(--gray-700)"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="minimal-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: "var(--space-6)" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "var(--space-1)",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "var(--gray-700)"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="minimal-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="minimal-button-primary"
            style={{ width: "100%", fontSize: "1rem" }}
          >
            {loading ? "Signing in..." : "Continue to Dashboard"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ 
          textAlign: "center", 
          marginTop: "var(--space-6)",
          fontSize: "0.875rem",
          color: "var(--gray-500)"
        }}>
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

