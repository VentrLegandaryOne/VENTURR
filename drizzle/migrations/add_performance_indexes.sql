-- Add Performance Indexes for VENTURR VALIDT
-- Migration Date: 2024-12-24
-- Purpose: Optimize frequently queried columns

-- Quotes table indexes
CREATE INDEX IF NOT EXISTS idx_quotes_userId ON quotes(userId);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_createdAt ON quotes(createdAt);
CREATE INDEX IF NOT EXISTS idx_quotes_user_status ON quotes(userId, status);
CREATE INDEX IF NOT EXISTS idx_quotes_user_created ON quotes(userId, createdAt DESC);

-- Verifications table indexes
CREATE INDEX IF NOT EXISTS idx_verifications_quoteId ON verifications(quoteId);
CREATE INDEX IF NOT EXISTS idx_verifications_statusBadge ON verifications(statusBadge);
CREATE INDEX IF NOT EXISTS idx_verifications_createdAt ON verifications(createdAt);

-- Comparisons table indexes (snake_case columns)
CREATE INDEX IF NOT EXISTS idx_comparison_groups_user_id ON comparison_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_groups_created_at ON comparison_groups(created_at);
CREATE INDEX IF NOT EXISTS idx_comparison_items_group_id ON comparison_items(group_id);

-- Contractors table indexes (snake_case columns)
CREATE INDEX IF NOT EXISTS idx_contractors_is_verified ON contractors(is_verified);
CREATE INDEX IF NOT EXISTS idx_contractors_avg_score ON contractors(avg_score);
CREATE INDEX IF NOT EXISTS idx_contractors_total_reviews ON contractors(total_reviews);

-- Contractor reviews table indexes (snake_case columns)
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_contractor_id ON contractor_reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_user_id ON contractor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_created_at ON contractor_reviews(created_at);

-- Notifications table indexes (snake_case columns)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Shared reports table indexes (snake_case columns)
CREATE INDEX IF NOT EXISTS idx_shared_reports_share_token ON shared_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_reports_expires_at ON shared_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_reports_quote_id ON shared_reports(quote_id);

-- Audit trail table indexes skipped (table doesn't exist in this version)
