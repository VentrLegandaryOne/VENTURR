import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  getProjectTask,
  getProjectTeamMembers,
  addProjectTeamMember,
  removeProjectTeamMember,
  getProjectMilestones,
  createProjectMilestone,
  updateProjectMilestone,
  getProjectBudget,
  createProjectBudget,
  updateProjectBudget,
  getProjectDocuments,
  addProjectDocument,
  deleteProjectDocument,
  getProject,
} from "../db";
import { TRPCError } from "@trpc/server";

const projectIdSchema = z.string().min(1, "Project ID required");

export const projectRouter = router({
  // TASKS
  tasks: router({
    list: protectedProcedure
      .input(z.object({ projectId: projectIdSchema }))
      .query(async ({ input }) => {
        try {
          const tasks = await getProjectTasks(input.projectId);
          return { success: true, data: tasks };
        } catch (error) {
          console.error("Error fetching project tasks:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch project tasks",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ taskId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const task = await getProjectTask(input.taskId);
          if (!task) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Task not found",
            });
          }
          return { success: true, data: task };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching task:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch task",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: projectIdSchema,
          title: z.string().min(1, "Title required"),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
          dueDate: z.date().optional(),
          assignedTo: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const task = await createProjectTask({
            id: `task_${Date.now()}`,
            projectId: input.projectId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            dueDate: input.dueDate,
            assignedTo: input.assignedTo,
            status: "todo",
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: null,
          });
          return { success: true, data: task };
        } catch (error) {
          console.error("Error creating task:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create task",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          taskId: z.string().min(1),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["todo", "in_progress", "review", "completed", "blocked"]).optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          assignedTo: z.string().optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { taskId, ...updates } = input;
          await updateProjectTask(taskId, {
            ...updates,
            updatedAt: new Date(),
          });
          const updated = await getProjectTask(taskId);
          return { success: true, data: updated };
        } catch (error) {
          console.error("Error updating task:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update task",
          });
        }
      }),
  }),

  // TEAM MEMBERS
  teamMembers: router({
    list: protectedProcedure
      .input(z.object({ projectId: projectIdSchema }))
      .query(async ({ input }) => {
        try {
          const members = await getProjectTeamMembers(input.projectId);
          return { success: true, data: members };
        } catch (error) {
          console.error("Error fetching team members:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch team members",
          });
        }
      }),

    add: protectedProcedure
      .input(
        z.object({
          projectId: projectIdSchema,
          userId: z.string().min(1, "User ID required"),
          role: z.enum(["lead", "worker", "supervisor", "inspector"]).default("worker"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const member = await addProjectTeamMember({
            id: `member_${Date.now()}`,
            projectId: input.projectId,
            userId: input.userId,
            role: input.role,
            joinedAt: new Date(),
            createdAt: new Date(),
          });
          return { success: true, data: member };
        } catch (error) {
          console.error("Error adding team member:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add team member",
          });
        }
      }),

    remove: protectedProcedure
      .input(z.object({ memberId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          await removeProjectTeamMember(input.memberId);
          return { success: true };
        } catch (error) {
          console.error("Error removing team member:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove team member",
          });
        }
      }),
  }),

  // MILESTONES
  milestones: router({
    list: protectedProcedure
      .input(z.object({ projectId: projectIdSchema }))
      .query(async ({ input }) => {
        try {
          const milestones = await getProjectMilestones(input.projectId);
          return { success: true, data: milestones };
        } catch (error) {
          console.error("Error fetching milestones:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch milestones",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: projectIdSchema,
          title: z.string().min(1, "Title required"),
          description: z.string().optional(),
          targetDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const milestone = await createProjectMilestone({
            id: `milestone_${Date.now()}`,
            projectId: input.projectId,
            title: input.title,
            description: input.description,
            targetDate: input.targetDate,
            completedDate: null,
            status: "pending",
            progress: "0",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return { success: true, data: milestone };
        } catch (error) {
          console.error("Error creating milestone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create milestone",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          milestoneId: z.string().min(1),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "delayed"]).optional(),
          progress: z.string().regex(/^\d{1,3}$/).optional(),
          completedDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { milestoneId, ...updates } = input;
          await updateProjectMilestone(milestoneId, {
            ...updates,
            updatedAt: new Date(),
          });
          return { success: true };
        } catch (error) {
          console.error("Error updating milestone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update milestone",
          });
        }
      }),
  }),

  // BUDGET
  budget: router({
    get: protectedProcedure
      .input(z.object({ projectId: projectIdSchema }))
      .query(async ({ input }) => {
        try {
          const budget = await getProjectBudget(input.projectId);
          return { success: true, data: budget };
        } catch (error) {
          console.error("Error fetching budget:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch budget",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: projectIdSchema,
          budgetedAmount: z.string().min(1, "Amount required"),
          currency: z.string().default("USD"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const budget = await createProjectBudget({
            id: `budget_${Date.now()}`,
            projectId: input.projectId,
            budgetedAmount: input.budgetedAmount,
            spentAmount: "0",
            remainingAmount: input.budgetedAmount,
            currency: input.currency,
            lastUpdated: new Date(),
          });
          return { success: true, data: budget };
        } catch (error) {
          console.error("Error creating budget:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create budget",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          budgetId: z.string().min(1),
          budgetedAmount: z.string().optional(),
          spentAmount: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { budgetId, ...updates } = input;
          await updateProjectBudget(budgetId, {
            ...updates,
            lastUpdated: new Date(),
          });
          return { success: true };
        } catch (error) {
          console.error("Error updating budget:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update budget",
          });
        }
      }),
  }),

  // DOCUMENTS
  documents: router({
    list: protectedProcedure
      .input(z.object({ projectId: projectIdSchema }))
      .query(async ({ input }) => {
        try {
          const documents = await getProjectDocuments(input.projectId);
          return { success: true, data: documents };
        } catch (error) {
          console.error("Error fetching documents:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch documents",
          });
        }
      }),

    add: protectedProcedure
      .input(
        z.object({
          projectId: projectIdSchema,
          title: z.string().min(1, "Title required"),
          type: z.enum(["drawing", "specification", "permit", "report", "contract", "other"]),
          fileUrl: z.string().url("Valid URL required"),
          fileSize: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const doc = await addProjectDocument({
            id: `doc_${Date.now()}`,
            projectId: input.projectId,
            title: input.title,
            type: input.type,
            fileUrl: input.fileUrl,
            fileSize: input.fileSize,
            uploadedBy: ctx.user.id,
            uploadedAt: new Date(),
          });
          return { success: true, data: doc };
        } catch (error) {
          console.error("Error adding document:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add document",
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ docId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          await deleteProjectDocument(input.docId);
          return { success: true };
        } catch (error) {
          console.error("Error deleting document:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete document",
          });
        }
      }),
  }),

  // PROJECT OVERVIEW
  overview: protectedProcedure
    .input(z.object({ projectId: projectIdSchema }))
    .query(async ({ input }) => {
      try {
        const project = await getProject(input.projectId);
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        const [tasks, teamMembers, milestones, budget, documents] = await Promise.all([
          getProjectTasks(input.projectId),
          getProjectTeamMembers(input.projectId),
          getProjectMilestones(input.projectId),
          getProjectBudget(input.projectId),
          getProjectDocuments(input.projectId),
        ]);

        return {
          success: true,
          data: {
            project,
            tasks: {
              total: tasks.length,
              completed: tasks.filter((t) => t.status === "completed").length,
              inProgress: tasks.filter((t) => t.status === "in_progress").length,
              blocked: tasks.filter((t) => t.status === "blocked").length,
            },
            teamMembers: teamMembers.length,
            milestones: {
              total: milestones.length,
              completed: milestones.filter((m) => m.status === "completed").length,
            },
            budget,
            documents: documents.length,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching project overview:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch project overview",
        });
      }
    }),
});

