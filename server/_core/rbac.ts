import { Request, Response, NextFunction } from 'express';
import { TRPCError } from '@trpc/server';

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

/**
 * Permission definitions
 * Granular permissions for fine-grained access control
 */
export enum Permission {
  // Project permissions
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_READ = 'projects:read',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',
  PROJECTS_EXPORT = 'projects:export',
  PROJECTS_IMPORT = 'projects:import',

  // Client permissions
  CLIENTS_CREATE = 'clients:create',
  CLIENTS_READ = 'clients:read',
  CLIENTS_UPDATE = 'clients:update',
  CLIENTS_DELETE = 'clients:delete',

  // Material permissions
  MATERIALS_CREATE = 'materials:create',
  MATERIALS_READ = 'materials:read',
  MATERIALS_UPDATE = 'materials:update',
  MATERIALS_DELETE = 'materials:delete',

  // Quote permissions
  QUOTES_CREATE = 'quotes:create',
  QUOTES_READ = 'quotes:read',
  QUOTES_UPDATE = 'quotes:update',
  QUOTES_DELETE = 'quotes:delete',

  // Compliance permissions
  COMPLIANCE_READ = 'compliance:read',
  COMPLIANCE_UPDATE = 'compliance:update',

  // Organization permissions
  ORG_SETTINGS_READ = 'org:settings:read',
  ORG_SETTINGS_UPDATE = 'org:settings:update',
  ORG_USERS_MANAGE = 'org:users:manage',

  // Admin permissions
  ADMIN_USERS_MANAGE = 'admin:users:manage',
  ADMIN_SYSTEM_CONFIG = 'admin:system:config',
  ADMIN_AUDIT_LOG = 'admin:audit:log',
}

/**
 * Role-based permission mapping
 * Defines which permissions each role has
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions for admins
    Permission.PROJECTS_CREATE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_UPDATE,
    Permission.PROJECTS_DELETE,
    Permission.PROJECTS_EXPORT,
    Permission.PROJECTS_IMPORT,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_READ,
    Permission.CLIENTS_UPDATE,
    Permission.CLIENTS_DELETE,
    Permission.MATERIALS_CREATE,
    Permission.MATERIALS_READ,
    Permission.MATERIALS_UPDATE,
    Permission.MATERIALS_DELETE,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
    Permission.QUOTES_DELETE,
    Permission.COMPLIANCE_READ,
    Permission.COMPLIANCE_UPDATE,
    Permission.ORG_SETTINGS_READ,
    Permission.ORG_SETTINGS_UPDATE,
    Permission.ORG_USERS_MANAGE,
    Permission.ADMIN_USERS_MANAGE,
    Permission.ADMIN_SYSTEM_CONFIG,
    Permission.ADMIN_AUDIT_LOG,
  ],

  [UserRole.USER]: [
    // Standard user permissions
    Permission.PROJECTS_CREATE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_UPDATE,
    Permission.PROJECTS_DELETE,
    Permission.PROJECTS_EXPORT,
    Permission.PROJECTS_IMPORT,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_READ,
    Permission.CLIENTS_UPDATE,
    Permission.CLIENTS_DELETE,
    Permission.MATERIALS_CREATE,
    Permission.MATERIALS_READ,
    Permission.MATERIALS_UPDATE,
    Permission.MATERIALS_DELETE,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
    Permission.QUOTES_DELETE,
    Permission.COMPLIANCE_READ,
    Permission.ORG_SETTINGS_READ,
  ],

  [UserRole.VIEWER]: [
    // Read-only permissions for viewers
    Permission.PROJECTS_READ,
    Permission.CLIENTS_READ,
    Permission.MATERIALS_READ,
    Permission.QUOTES_READ,
    Permission.COMPLIANCE_READ,
    Permission.ORG_SETTINGS_READ,
  ],
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        reason: 'insufficient_role',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role as UserRole;
    const hasRequiredPermission = hasAnyPermission(userRole, permissions);

    if (!hasRequiredPermission) {
      return res.status(403).json({ 
        error: 'Forbidden',
        reason: 'insufficient_permissions',
        requiredPermissions: permissions,
        userPermissions: rolePermissions[userRole] || [],
      });
    }

    next();
  };
}

/**
 * TRPC-compatible role check
 */
export function checkRole(userRole: UserRole | undefined, ...roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole as UserRole);
}

/**
 * TRPC-compatible permission check
 */
export function checkPermission(userRole: UserRole | undefined, ...permissions: Permission[]): boolean {
  if (!userRole) return false;
  return hasAnyPermission(userRole as UserRole, permissions);
}

/**
 * TRPC procedure wrapper for role-based access
 */
export function protectedProcedureWithRole(...roles: UserRole[]) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    if (!roles.includes(ctx.user.role as UserRole)) {
      throw new TRPCError({ 
        code: 'FORBIDDEN',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }
  };
}

/**
 * TRPC procedure wrapper for permission-based access
 */
export function protectedProcedureWithPermission(...permissions: Permission[]) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userRole = ctx.user.role as UserRole;
    if (!hasAnyPermission(userRole, permissions)) {
      throw new TRPCError({ 
        code: 'FORBIDDEN',
        message: `This action requires one of the following permissions: ${permissions.join(', ')}`,
      });
    }
  };
}

/**
 * Get user's permissions
 */
export function getUserPermissions(userRole: UserRole): Permission[] {
  return rolePermissions[userRole] || [];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator with full system access',
    [UserRole.USER]: 'Standard user with project management access',
    [UserRole.VIEWER]: 'Read-only user with view-only access',
  };
  return descriptions[role] || 'Unknown role';
}

export default {
  UserRole,
  Permission,
  rolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requireRole,
  requirePermission,
  checkRole,
  checkPermission,
  protectedProcedureWithRole,
  protectedProcedureWithPermission,
  getUserPermissions,
  getRoleDescription,
};

