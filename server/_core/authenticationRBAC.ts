/**
 * Authentication & Role-Based Access Control System
 * User authentication, role management, JWT tokens, secure endpoints
 */

import jwt from 'jsonwebtoken';

export type UserRole = 'admin' | 'manager' | 'team_member' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // hashed
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string; // 'projects', 'quotes', 'payments', 'team', 'reports', 'settings'
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
}

export interface JWTToken {
  token: string;
  expiresAt: Date;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface RolePermissions {
  [key in UserRole]: Permission[];
}

class AuthenticationRBACManager {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

  // Define role-based permissions
  private rolePermissions: RolePermissions = {
    admin: [
      {
        id: 'admin-all',
        name: 'Full Access',
        description: 'Full access to all resources',
        resource: '*',
        action: 'create',
      },
    ],
    manager: [
      {
        id: 'manager-projects',
        name: 'Manage Projects',
        description: 'Create, read, update projects',
        resource: 'projects',
        action: 'update',
      },
      {
        id: 'manager-quotes',
        name: 'Manage Quotes',
        description: 'Create and approve quotes',
        resource: 'quotes',
        action: 'approve',
      },
      {
        id: 'manager-team',
        name: 'Manage Team',
        description: 'View and manage team members',
        resource: 'team',
        action: 'update',
      },
      {
        id: 'manager-reports',
        name: 'View Reports',
        description: 'Access business reports',
        resource: 'reports',
        action: 'read',
      },
    ],
    team_member: [
      {
        id: 'team-projects-read',
        name: 'View Projects',
        description: 'View assigned projects',
        resource: 'projects',
        action: 'read',
      },
      {
        id: 'team-projects-update',
        name: 'Update Projects',
        description: 'Update project status and progress',
        resource: 'projects',
        action: 'update',
      },
      {
        id: 'team-quotes-read',
        name: 'View Quotes',
        description: 'View project quotes',
        resource: 'quotes',
        action: 'read',
      },
    ],
    client: [
      {
        id: 'client-projects-read',
        name: 'View Projects',
        description: 'View own projects',
        resource: 'projects',
        action: 'read',
      },
      {
        id: 'client-quotes-read',
        name: 'View Quotes',
        description: 'View quotes for own projects',
        resource: 'quotes',
        action: 'read',
      },
      {
        id: 'client-payments-read',
        name: 'View Payments',
        description: 'View payment status',
        resource: 'payments',
        action: 'read',
      },
    ],
  };

  /**
   * Register new user
   */
  public async signup(request: SignupRequest): Promise<{ user: User; tokens: JWTToken }> {
    // Check if user exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === request.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const userId = `user-${Date.now()}`;
    const organizationId = `org-${Date.now()}`;

    const user: User = {
      id: userId,
      email: request.email,
      name: request.name,
      password: this.hashPassword(request.password), // In production, use bcrypt
      role: 'admin', // First user is admin
      organizationId,
      isActive: true,
      createdAt: new Date(),
      permissions: this.rolePermissions.admin,
    };

    this.users.set(userId, user);

    const tokens = this.generateTokens(user);

    console.log(`[Auth] User registered: ${user.email}`);
    return { user, tokens };
  }

  /**
   * Login user
   */
  public async login(request: LoginRequest): Promise<{ user: User; tokens: JWTToken }> {
    const user = Array.from(this.users.values()).find((u) => u.email === request.email);

    if (!user || !this.verifyPassword(request.password, user.password)) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    user.lastLogin = new Date();
    const tokens = this.generateTokens(user);

    console.log(`[Auth] User logged in: ${user.email}`);
    return { user, tokens };
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): { userId: string; role: UserRole } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: string;
        role: UserRole;
      };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  public refreshToken(refreshToken: string): JWTToken | null {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as {
        userId: string;
      };
      const user = this.users.get(decoded.userId);

      if (!user) return null;

      return this.generateTokens(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user has permission
   */
  public hasPermission(
    userId: string,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'approve'
  ): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check role permissions
    const rolePerms = this.rolePermissions[user.role];
    return rolePerms.some((p) => (p.resource === '*' || p.resource === resource) && p.action === action);
  }

  /**
   * Get user by ID
   */
  public getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by email
   */
  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  /**
   * Update user role
   */
  public updateUserRole(userId: string, newRole: UserRole): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.role = newRole;
    user.permissions = this.rolePermissions[newRole];

    console.log(`[Auth] User role updated: ${userId} -> ${newRole}`);
    return true;
  }

  /**
   * Deactivate user
   */
  public deactivateUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.isActive = false;

    console.log(`[Auth] User deactivated: ${userId}`);
    return true;
  }

  /**
   * List users in organization
   */
  public getUsersByOrganization(organizationId: string): User[] {
    return Array.from(this.users.values()).filter((u) => u.organizationId === organizationId);
  }

  /**
   * Get user permissions
   */
  public getUserPermissions(userId: string): Permission[] {
    const user = this.users.get(userId);
    return user ? user.permissions : [];
  }

  /**
   * Generate JWT and refresh tokens
   */
  private generateTokens(user: User): JWTToken {
    const expiresIn = '24h';
    const refreshExpiresIn = '7d';

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      this.jwtSecret,
      { expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshTokenSecret,
      { expiresIn: refreshExpiresIn }
    );

    return {
      token,
      expiresAt: new Date(Date.now() + 24 * 3600000),
      refreshToken,
    };
  }

  /**
   * Hash password (simplified - use bcrypt in production)
   */
  private hashPassword(password: string): string {
    // In production, use bcrypt.hash()
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hash: string): boolean {
    // In production, use bcrypt.compare()
    return Buffer.from(password).toString('base64') === hash;
  }

  /**
   * Get authentication statistics
   */
  public getAuthStatistics() {
    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter((u) => u.isActive).length;
    const usersByRole: Record<UserRole, number> = {
      admin: 0,
      manager: 0,
      team_member: 0,
      client: 0,
    };

    for (const user of this.users.values()) {
      usersByRole[user.role]++;
    }

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      activeSessions: this.sessions.size,
    };
  }
}

// Export singleton instance
export const authRBACManager = new AuthenticationRBACManager();

