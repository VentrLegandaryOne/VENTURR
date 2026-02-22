import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Never expose internal stack traces in production
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };
  },
});

export const router = t.router;

// Global error handling middleware - catches all unhandled errors and converts them to proper TRPCErrors
const errorHandlingMiddleware = t.middleware(async ({ next, path }) => {
  try {
    return await next();
  } catch (error) {
    // Re-throw TRPCErrors as-is (they're already properly formatted)
    if (error instanceof TRPCError) {
      throw error;
    }
    
    // Log unexpected errors for debugging
    console.error(`[tRPC Error] ${path}:`, error instanceof Error ? error.message : error);
    
    // Convert unknown errors to INTERNAL_SERVER_ERROR
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      cause: error,
    });
  }
});

// Apply global error handling to all procedures
export const publicProcedure = t.procedure.use(errorHandlingMiddleware);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(errorHandlingMiddleware).use(requireUser);

export const adminProcedure = t.procedure.use(errorHandlingMiddleware).use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
