-- ====================================================================
-- Database Schema for Transaction Validator & Approval System
-- ====================================================================

-- 1. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'AUTHORIZED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100),
    customer_name VARCHAR(255),
    account_number VARCHAR(100),
    amount NUMERIC(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'AUTHORIZED', 'FAILED'
    error_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique index ensuring active (PENDING or AUTHORIZED) transactions have unique transaction_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_valid_tx_id 
ON transactions(transaction_id) 
WHERE status IN ('PENDING', 'AUTHORIZED');

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- 'BATCH_UPLOADED', 'BATCH_APPROVED'
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast batch transactions lookup
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
