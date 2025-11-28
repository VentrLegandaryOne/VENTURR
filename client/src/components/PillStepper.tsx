import "../styles/minimal-design.css";

interface Step {
  id: number;
  label: string;
  status: "pending" | "active" | "completed";
}

interface PillStepperProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export function PillStepper({ steps, onStepClick }: PillStepperProps) {
  return (
    <div className="pill-stepper">
      {steps.map((step, index) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`pill-step ${step.status === "active" ? "active" : ""} ${
              step.status === "completed" ? "completed" : ""
            }`}
            onClick={() => onStepClick?.(step.id)}
            style={{ cursor: onStepClick ? "pointer" : "default" }}
          >
            <span style={{ marginRight: "var(--space-1)" }}>{step.id}.</span>
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <div style={{ 
              width: "24px", 
              height: "2px", 
              background: "var(--gray-200)",
              margin: "0 var(--space-1)"
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

