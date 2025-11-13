CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS practice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    language TEXT NOT NULL,
    wpm INTEGER NOT NULL CHECK (wpm >= 0),
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    errors INTEGER NOT NULL CHECK (errors >= 0),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_history_user_completed_at
    ON practice_history (user_id, completed_at DESC);

