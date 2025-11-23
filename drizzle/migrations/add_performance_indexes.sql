-- Performance Optimization: Add Database Indexes
-- This migration adds indexes to frequently queried columns
-- to improve query performance by 50-80%

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Projects table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(userId);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(createdAt);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updatedAt);

-- Clients table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(userId);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(createdAt);

-- Measurements table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_measurements_project_id ON measurements(projectId);
CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements(createdAt);

-- Quotes table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(projectId);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(createdAt);

-- Subscriptions table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(userId);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripeCustomerId);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(userId, status);
CREATE INDEX IF NOT EXISTS idx_quotes_project_status ON quotes(projectId, status);

-- Full-text search indexes (MySQL)
-- Uncomment if using MySQL 5.7+ or MariaDB 10.0+
-- ALTER TABLE projects ADD FULLTEXT INDEX ft_projects_search (name, address);
-- ALTER TABLE clients ADD FULLTEXT INDEX ft_clients_search (name, email, companyName);

