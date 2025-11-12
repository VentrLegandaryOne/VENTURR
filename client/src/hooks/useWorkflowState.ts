/**
 * useWorkflowState Hook
 * 
 * Manages VENTURR MVP Core Workflow state and transitions
 */

import { useState, useEffect, useMemo } from 'react';
import { WorkflowStage } from '@/components/WorkflowStepper';

interface Project {
  id: string;
  status?: string;
  measurements?: any[];
  takeoffs?: any[];
  quotes?: any[];
}

interface WorkflowState {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  nextStage: WorkflowStage | null;
  canProgress: boolean;
  validationErrors: string[];
  progress: number;
}

interface UseWorkflowStateReturn extends WorkflowState {
  goToStage: (stage: WorkflowStage) => void;
  completeStage: (stage: WorkflowStage) => void;
  getNextStageUrl: () => string | null;
  isStageAccessible: (stage: WorkflowStage) => boolean;
}

const STAGE_ORDER: WorkflowStage[] = [
  WorkflowStage.LEAD,
  WorkflowStage.SITE_CAPTURE,
  WorkflowStage.TAKEOFF,
  WorkflowStage.QUOTE,
  WorkflowStage.ARCHIVE,
];

const STAGE_ROUTES: Record<WorkflowStage, string> = {
  [WorkflowStage.LEAD]: '/projects/new',
  [WorkflowStage.SITE_CAPTURE]: '/site-measurement',
  [WorkflowStage.TAKEOFF]: '/calculator',
  [WorkflowStage.QUOTE]: '/quote-generator',
  [WorkflowStage.ARCHIVE]: '/projects',
};

/**
 * Determine current workflow stage based on project data
 */
function determineCurrentStage(project: Project | null): WorkflowStage {
  if (!project) return WorkflowStage.LEAD;
  
  // If project has quotes, it's at Quote stage
  if (project.quotes && project.quotes.length > 0) {
    return project.status === 'completed' ? WorkflowStage.ARCHIVE : WorkflowStage.QUOTE;
  }
  
  // If project has takeoffs, it's at Takeoff stage
  if (project.takeoffs && project.takeoffs.length > 0) {
    return WorkflowStage.TAKEOFF;
  }
  
  // If project has measurements, it's at Site Capture stage
  if (project.measurements && project.measurements.length > 0) {
    return WorkflowStage.SITE_CAPTURE;
  }
  
  // Otherwise, still at Lead stage
  return WorkflowStage.LEAD;
}

/**
 * Determine completed stages based on project data
 */
function determineCompletedStages(project: Project | null): WorkflowStage[] {
  if (!project) return [];
  
  const completed: WorkflowStage[] = [WorkflowStage.LEAD]; // Lead is always completed if project exists
  
  if (project.measurements && project.measurements.length > 0) {
    completed.push(WorkflowStage.SITE_CAPTURE);
  }
  
  if (project.takeoffs && project.takeoffs.length > 0) {
    completed.push(WorkflowStage.TAKEOFF);
  }
  
  if (project.quotes && project.quotes.length > 0) {
    completed.push(WorkflowStage.QUOTE);
  }
  
  if (project.status === 'completed') {
    completed.push(WorkflowStage.ARCHIVE);
  }
  
  return completed;
}

/**
 * Validate if stage can be progressed
 */
function validateStage(stage: WorkflowStage, project: Project | null): string[] {
  const errors: string[] = [];
  
  if (!project) {
    errors.push('Project not found');
    return errors;
  }
  
  switch (stage) {
    case WorkflowStage.LEAD:
      if (!project.id) errors.push('Project details incomplete');
      break;
      
    case WorkflowStage.SITE_CAPTURE:
      if (!project.measurements || project.measurements.length === 0) {
        errors.push('No measurements recorded');
      }
      break;
      
    case WorkflowStage.TAKEOFF:
      if (!project.takeoffs || project.takeoffs.length === 0) {
        errors.push('No takeoff calculations completed');
      }
      break;
      
    case WorkflowStage.QUOTE:
      if (!project.quotes || project.quotes.length === 0) {
        errors.push('No quote generated');
      }
      break;
      
    case WorkflowStage.ARCHIVE:
      if (project.status !== 'completed') {
        errors.push('Project not marked as completed');
      }
      break;
  }
  
  return errors;
}

/**
 * Custom hook for workflow state management
 */
export function useWorkflowState(project: Project | null): UseWorkflowStateReturn {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(
    determineCurrentStage(project)
  );
  
  const completedStages = useMemo(
    () => determineCompletedStages(project),
    [project]
  );
  
  const validationErrors = useMemo(
    () => validateStage(currentStage, project),
    [currentStage, project]
  );
  
  const nextStage = useMemo(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
      return null;
    }
    return STAGE_ORDER[currentIndex + 1];
  }, [currentStage]);
  
  const canProgress = useMemo(() => {
    return validationErrors.length === 0 && nextStage !== null;
  }, [validationErrors, nextStage]);
  
  const progress = useMemo(() => {
    return ((completedStages.length) / STAGE_ORDER.length) * 100;
  }, [completedStages]);
  
  // Update current stage when project changes
  useEffect(() => {
    const newStage = determineCurrentStage(project);
    if (newStage !== currentStage) {
      setCurrentStage(newStage);
    }
  }, [project]);
  
  const goToStage = (stage: WorkflowStage) => {
    setCurrentStage(stage);
  };
  
  const completeStage = (stage: WorkflowStage) => {
    // This should trigger a backend update to mark stage as complete
    // For now, just update local state
    const currentIndex = STAGE_ORDER.indexOf(stage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      setCurrentStage(STAGE_ORDER[currentIndex + 1]);
    }
  };
  
  const getNextStageUrl = (): string | null => {
    if (!nextStage || !project) return null;
    const baseUrl = STAGE_ROUTES[nextStage];
    return `${baseUrl}?projectId=${project.id}`;
  };
  
  const isStageAccessible = (stage: WorkflowStage): boolean => {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    
    // Can access completed stages or current stage or next stage
    return completedStages.includes(stage) || 
           stage === currentStage || 
           stageIndex === currentIndex + 1;
  };
  
  return {
    currentStage,
    completedStages,
    nextStage,
    canProgress,
    validationErrors,
    progress,
    goToStage,
    completeStage,
    getNextStageUrl,
    isStageAccessible,
  };
}

