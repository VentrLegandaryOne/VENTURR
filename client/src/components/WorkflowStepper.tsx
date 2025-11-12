/**
 * WorkflowStepper Component
 * 
 * Visual progress indicator for VENTURR MVP Core Workflow:
 * Lead → Site Capture → Takeoff → Quote → Archive
 */

import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export enum WorkflowStage {
  LEAD = 'lead',
  SITE_CAPTURE = 'site_capture',
  TAKEOFF = 'takeoff',
  QUOTE = 'quote',
  ARCHIVE = 'archive',
}

interface WorkflowStep {
  id: WorkflowStage;
  label: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: WorkflowStage.LEAD,
    label: 'Lead',
    description: 'Project details & client info',
  },
  {
    id: WorkflowStage.SITE_CAPTURE,
    label: 'Site Capture',
    description: 'Measure roof area & dimensions',
  },
  {
    id: WorkflowStage.TAKEOFF,
    label: 'Takeoff',
    description: 'Calculate materials & costs',
  },
  {
    id: WorkflowStage.QUOTE,
    label: 'Quote',
    description: 'Generate proposal & PDF',
  },
  {
    id: WorkflowStage.ARCHIVE,
    label: 'Archive',
    description: 'Complete & store project',
  },
];

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  onStageClick?: (stage: WorkflowStage) => void;
  className?: string;
}

export function WorkflowStepper({
  currentStage,
  completedStages,
  onStageClick,
  className,
}: WorkflowStepperProps) {
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === currentStage);

  const getStepStatus = (step: WorkflowStep, index: number): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (completedStages.includes(step.id)) return 'completed';
    if (step.id === currentStage) return 'current';
    if (index <= currentIndex + 1) return 'upcoming';
    return 'locked';
  };

  const isClickable = (step: WorkflowStep, status: string): boolean => {
    return status === 'completed' || status === 'current';
  };

  return (
    <div className={cn('w-full py-6', className)}>
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step, index);
          const clickable = isClickable(step, status);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => clickable && onStageClick?.(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all',
                    {
                      'bg-primary border-primary text-primary-foreground': status === 'completed',
                      'bg-primary/10 border-primary text-primary': status === 'current',
                      'bg-muted border-muted-foreground/30 text-muted-foreground': status === 'upcoming',
                      'bg-muted border-muted-foreground/20 text-muted-foreground/50': status === 'locked',
                      'cursor-pointer hover:scale-110': clickable,
                      'cursor-not-allowed': !clickable,
                    }
                  )}
                >
                  {status === 'completed' && <Check className="w-6 h-6" />}
                  {status === 'current' && <Circle className="w-6 h-6 fill-current" />}
                  {status === 'upcoming' && <Circle className="w-6 h-6" />}
                  {status === 'locked' && <Lock className="w-5 h-5" />}
                </button>

                {/* Step Label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={cn('text-sm font-medium', {
                      'text-primary': status === 'completed' || status === 'current',
                      'text-muted-foreground': status === 'upcoming' || status === 'locked',
                    })}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mt-[-60px]">
                  <div
                    className={cn('h-full transition-all', {
                      'bg-primary': completedStages.includes(step.id),
                      'bg-muted-foreground/30': !completedStages.includes(step.id),
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Workflow Progress Bar (Compact Version)
 */
interface WorkflowProgressBarProps {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  className?: string;
}

export function WorkflowProgressBar({
  currentStage,
  completedStages,
  className,
}: WorkflowProgressBarProps) {
  const totalSteps = WORKFLOW_STEPS.length;
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === currentStage);
  const progress = ((completedStages.length + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {WORKFLOW_STEPS.find((s) => s.id === currentStage)?.label}
        </span>
        <span className="text-sm text-muted-foreground">
          {completedStages.length + 1} of {totalSteps}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

