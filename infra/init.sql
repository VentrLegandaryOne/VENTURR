-- Venturr Dual-Intelligence Database Schema
-- PostgreSQL with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL,
    event VARCHAR(50) NOT NULL,
    details JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_task_id (task_id),
    INDEX idx_audit_event (event),
    INDEX idx_audit_timestamp (timestamp)
);

-- Evaluation Metrics Table
CREATE TABLE IF NOT EXISTS eval_metrics (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL,
    metric VARCHAR(50) NOT NULL,
    value NUMERIC(10, 4) NOT NULL,
    baseline NUMERIC(10, 4),
    improvement NUMERIC(10, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metrics_task_id (task_id),
    INDEX idx_metrics_metric (metric),
    INDEX idx_metrics_timestamp (timestamp)
);

-- Task Results Cache Table
CREATE TABLE IF NOT EXISTS task_results (
    id UUID PRIMARY KEY,
    task_id UUID UNIQUE NOT NULL,
    mode VARCHAR(50) NOT NULL,
    goal TEXT NOT NULL,
    input JSONB,
    output JSONB,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    metrics JSONB,
    trace_id VARCHAR(255),
    user_id VARCHAR(255),
    organization_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_results_task_id (task_id),
    INDEX idx_results_mode (mode),
    INDEX idx_results_status (status),
    INDEX idx_results_user_id (user_id),
    INDEX idx_results_org_id (organization_id),
    INDEX idx_results_created_at (created_at)
);

-- Embeddings Table (for semantic search)
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_embeddings_entity (entity_type, entity_id)
);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
ON embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Tool Execution Logs Table
CREATE TABLE IF NOT EXISTS tool_executions (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    args JSONB,
    result JSONB,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_tool_task_id (task_id),
    INDEX idx_tool_name (tool_name),
    INDEX idx_tool_status (status)
);

-- LLM Call Logs Table
CREATE TABLE IF NOT EXISTS llm_calls (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt TEXT,
    response TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost NUMERIC(10, 6),
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_llm_task_id (task_id),
    INDEX idx_llm_model (model),
    INDEX idx_llm_created_at (created_at)
);

-- Spike7B Call Logs Table
CREATE TABLE IF NOT EXISTS spike_calls (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL,
    mode VARCHAR(50) NOT NULL,
    request JSONB,
    response JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_spike_task_id (task_id),
    INDEX idx_spike_mode (mode),
    INDEX idx_spike_created_at (created_at)
);

-- Performance Baselines Table
CREATE TABLE IF NOT EXISTS performance_baselines (
    id SERIAL PRIMARY KEY,
    task_type VARCHAR(100) NOT NULL UNIQUE,
    avg_latency_ms INTEGER NOT NULL,
    avg_cost NUMERIC(10, 6) NOT NULL,
    avg_accuracy NUMERIC(5, 2),
    sample_size INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default baselines
INSERT INTO performance_baselines (task_type, avg_latency_ms, avg_cost, avg_accuracy, sample_size)
VALUES 
    ('quote_generation', 2000, 0.005, 90.0, 100),
    ('material_extraction', 100, 0.0001, 95.0, 100),
    ('compliance_check', 1500, 0.003, 92.0, 100),
    ('labor_estimation', 500, 0.001, 88.0, 100),
    ('environmental_risk', 800, 0.002, 93.0, 100)
ON CONFLICT (task_type) DO NOTHING;

-- Create materialized view for aggregate metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    metric,
    COUNT(*) as count,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value
FROM eval_metrics
GROUP BY DATE_TRUNC('hour', timestamp), metric;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_metrics_summary_hour ON metrics_summary(hour);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_metrics_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY metrics_summary;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO venturr;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO venturr;

