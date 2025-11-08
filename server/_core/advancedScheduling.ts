/**
 * Advanced Scheduling & Resource Planning System
 * Team calendar, resource allocation, timeline visualization, conflict detection
 */

export interface ScheduledProject {
  id: string;
  projectId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  assignedTeam: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  milestones: Milestone[];
  dependencies: string[]; // Other project IDs
  resourceRequirements: ResourceRequirement[];
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  description: string;
}

export interface ResourceRequirement {
  resourceType: 'equipment' | 'material' | 'labor' | 'vehicle';
  quantity: number;
  unit: string;
  requiredDate: Date;
}

export interface TeamMemberSchedule {
  memberId: string;
  name: string;
  role: string;
  availability: 'available' | 'busy' | 'on_leave';
  assignedProjects: string[];
  workload: number; // percentage 0-100
  skills: string[];
  certifications: string[];
}

export interface ScheduleConflict {
  id: string;
  type: 'resource_conflict' | 'team_conflict' | 'timeline_conflict' | 'dependency_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedProjects: string[];
  affectedTeamMembers: string[];
  description: string;
  suggestedResolution: string;
  createdAt: Date;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  teamMemberId: string;
  role: string;
  allocationPercentage: number; // 0-100
  startDate: Date;
  endDate: Date;
  status: 'allocated' | 'confirmed' | 'completed';
}

export interface TimelineVisualization {
  projectId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  milestones: Array<{
    name: string;
    date: Date;
    status: string;
  }>;
  dependencies: string[];
  criticalPath: string[];
}

class AdvancedSchedulingManager {
  private scheduledProjects: Map<string, ScheduledProject> = new Map();
  private teamSchedules: Map<string, TeamMemberSchedule> = new Map();
  private resourceAllocations: Map<string, ResourceAllocation[]> = new Map();
  private scheduleConflicts: Map<string, ScheduleConflict[]> = new Map();
  private milestones: Map<string, Milestone[]> = new Map();

  /**
   * Schedule project
   */
  public scheduleProject(
    projectId: string,
    title: string,
    startDate: Date,
    endDate: Date,
    assignedTeam: string[],
    priority: ScheduledProject['priority'] = 'medium'
  ): ScheduledProject {
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);

    const project: ScheduledProject = {
      id: `schedule-${Date.now()}`,
      projectId,
      title,
      startDate,
      endDate,
      duration,
      assignedTeam,
      status: 'scheduled',
      priority,
      milestones: [],
      dependencies: [],
      resourceRequirements: [],
    };

    this.scheduledProjects.set(projectId, project);
    this.milestones.set(projectId, []);
    this.resourceAllocations.set(projectId, []);
    this.scheduleConflicts.set(projectId, []);

    // Check for conflicts
    this.detectConflicts(projectId);

    console.log(`[AdvancedScheduling] Project scheduled: ${projectId}`);
    return project;
  }

  /**
   * Add milestone
   */
  public addMilestone(
    projectId: string,
    name: string,
    dueDate: Date,
    assignedTo: string,
    description: string
  ): Milestone | null {
    const project = this.scheduledProjects.get(projectId);
    if (!project) return null;

    const milestone: Milestone = {
      id: `milestone-${Date.now()}`,
      projectId,
      name,
      dueDate,
      status: 'pending',
      assignedTo,
      description,
    };

    project.milestones.push(milestone);
    this.milestones.get(projectId)?.push(milestone);

    console.log(`[AdvancedScheduling] Milestone added: ${projectId} - ${name}`);
    return milestone;
  }

  /**
   * Allocate team member to project
   */
  public allocateTeamMember(
    projectId: string,
    teamMemberId: string,
    role: string,
    allocationPercentage: number,
    startDate: Date,
    endDate: Date
  ): ResourceAllocation | null {
    const project = this.scheduledProjects.get(projectId);
    if (!project) return null;

    const allocation: ResourceAllocation = {
      id: `alloc-${Date.now()}`,
      projectId,
      teamMemberId,
      role,
      allocationPercentage,
      startDate,
      endDate,
      status: 'allocated',
    };

    this.resourceAllocations.get(projectId)?.push(allocation);

    // Update team schedule
    const teamSchedule = this.teamSchedules.get(teamMemberId);
    if (teamSchedule) {
      teamSchedule.assignedProjects.push(projectId);
      teamSchedule.workload += allocationPercentage;
    }

    // Check for conflicts
    this.detectConflicts(projectId);

    console.log(`[AdvancedScheduling] Team member allocated: ${projectId} - ${teamMemberId}`);
    return allocation;
  }

  /**
   * Register team member
   */
  public registerTeamMember(
    memberId: string,
    name: string,
    role: string,
    skills: string[] = [],
    certifications: string[] = []
  ): TeamMemberSchedule {
    const schedule: TeamMemberSchedule = {
      memberId,
      name,
      role,
      availability: 'available',
      assignedProjects: [],
      workload: 0,
      skills,
      certifications,
    };

    this.teamSchedules.set(memberId, schedule);

    console.log(`[AdvancedScheduling] Team member registered: ${memberId}`);
    return schedule;
  }

  /**
   * Detect scheduling conflicts
   */
  private detectConflicts(projectId: string): void {
    const project = this.scheduledProjects.get(projectId);
    if (!project) return;

    const conflicts: ScheduleConflict[] = [];

    // Check for team member overallocation
    for (const teamMemberId of project.assignedTeam) {
      const schedule = this.teamSchedules.get(teamMemberId);
      if (schedule && schedule.workload > 100) {
        conflicts.push({
          id: `conflict-${Date.now()}`,
          type: 'team_conflict',
          severity: 'high',
          affectedProjects: [projectId],
          affectedTeamMembers: [teamMemberId],
          description: `Team member ${schedule.name} is overallocated (${schedule.workload}%)`,
          suggestedResolution: 'Reassign tasks or extend timeline',
          createdAt: new Date(),
        });
      }
    }

    // Check for resource conflicts
    const allocations = this.resourceAllocations.get(projectId) || [];
    for (const alloc of allocations) {
      const overlappingAllocations = this.findOverlappingAllocations(
        alloc.teamMemberId,
        alloc.startDate,
        alloc.endDate
      );

      if (overlappingAllocations.length > 0) {
        conflicts.push({
          id: `conflict-${Date.now()}`,
          type: 'resource_conflict',
          severity: 'medium',
          affectedProjects: [projectId, ...overlappingAllocations.map((a) => a.projectId)],
          affectedTeamMembers: [alloc.teamMemberId],
          description: `Resource conflict detected for ${alloc.teamMemberId}`,
          suggestedResolution: 'Adjust allocation dates or find alternative resources',
          createdAt: new Date(),
        });
      }
    }

    this.scheduleConflicts.set(projectId, conflicts);
  }

  /**
   * Find overlapping allocations
   */
  private findOverlappingAllocations(
    teamMemberId: string,
    startDate: Date,
    endDate: Date
  ): ResourceAllocation[] {
    const overlapping: ResourceAllocation[] = [];

    for (const [, allocations] of this.resourceAllocations) {
      for (const alloc of allocations) {
        if (
          alloc.teamMemberId === teamMemberId &&
          alloc.startDate < endDate &&
          alloc.endDate > startDate
        ) {
          overlapping.push(alloc);
        }
      }
    }

    return overlapping;
  }

  /**
   * Optimize resource allocation
   */
  public optimizeResourceAllocation(projectId: string): ResourceAllocation[] {
    const project = this.scheduledProjects.get(projectId);
    if (!project) return [];

    const allocations = this.resourceAllocations.get(projectId) || [];
    const optimized: ResourceAllocation[] = [];

    // Sort by priority and workload
    const sorted = allocations.sort((a, b) => {
      const teamA = this.teamSchedules.get(a.teamMemberId);
      const teamB = this.teamSchedules.get(b.teamMemberId);
      return (teamA?.workload || 0) - (teamB?.workload || 0);
    });

    for (const alloc of sorted) {
      const team = this.teamSchedules.get(alloc.teamMemberId);
      if (team && team.workload <= 100) {
        optimized.push(alloc);
      }
    }

    console.log(`[AdvancedScheduling] Resource allocation optimized: ${projectId}`);
    return optimized;
  }

  /**
   * Get timeline visualization
   */
  public getTimelineVisualization(projectId: string): TimelineVisualization | null {
    const project = this.scheduledProjects.get(projectId);
    if (!project) return null;

    const milestones = this.milestones.get(projectId) || [];
    const criticalPath = this.calculateCriticalPath(projectId);

    return {
      projectId,
      title: project.title,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: 0, // Would be calculated from actual progress
      milestones: milestones.map((m) => ({
        name: m.name,
        date: m.dueDate,
        status: m.status,
      })),
      dependencies: project.dependencies,
      criticalPath,
    };
  }

  /**
   * Calculate critical path
   */
  private calculateCriticalPath(projectId: string): string[] {
    // Simplified critical path calculation
    const project = this.scheduledProjects.get(projectId);
    if (!project) return [];

    return project.dependencies.length > 0 ? project.dependencies : [projectId];
  }

  /**
   * Get team workload
   */
  public getTeamWorkload(): Record<string, number> {
    const workload: Record<string, number> = {};

    for (const [memberId, schedule] of this.teamSchedules) {
      workload[memberId] = schedule.workload;
    }

    return workload;
  }

  /**
   * Get scheduling conflicts
   */
  public getSchedulingConflicts(projectId: string): ScheduleConflict[] {
    return this.scheduleConflicts.get(projectId) || [];
  }

  /**
   * Get project schedule
   */
  public getProjectSchedule(projectId: string): ScheduledProject | undefined {
    return this.scheduledProjects.get(projectId);
  }

  /**
   * Get team member schedule
   */
  public getTeamMemberSchedule(memberId: string): TeamMemberSchedule | undefined {
    return this.teamSchedules.get(memberId);
  }

  /**
   * Get scheduling statistics
   */
  public getSchedulingStatistics() {
    let totalProjects = 0;
    let projectsOnTrack = 0;
    let averageTeamUtilization = 0;
    let totalConflicts = 0;

    for (const [, project] of this.scheduledProjects) {
      totalProjects++;
      if (project.status === 'in_progress') {
        projectsOnTrack++;
      }
    }

    let totalWorkload = 0;
    for (const [, schedule] of this.teamSchedules) {
      totalWorkload += schedule.workload;
    }
    averageTeamUtilization =
      this.teamSchedules.size > 0 ? totalWorkload / this.teamSchedules.size : 0;

    for (const [, conflicts] of this.scheduleConflicts) {
      totalConflicts += conflicts.length;
    }

    return {
      totalProjects,
      projectsOnTrack,
      averageTeamUtilization: Math.min(100, averageTeamUtilization),
      totalConflicts,
      teamMembersCount: this.teamSchedules.size,
    };
  }
}

// Export singleton instance
export const advancedSchedulingManager = new AdvancedSchedulingManager();

