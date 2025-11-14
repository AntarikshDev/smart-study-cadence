-- Leaderboard Schema for Revision Planner
-- This schema works with existing rp_sessions, rp_topics, and rp_schedule tables

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS rp_leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  rank INTEGER NOT NULL,
  on_time_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  weekly_minutes INTEGER NOT NULL DEFAULT 0,
  avg_time_per_revision INTEGER NOT NULL DEFAULT 0,
  consistency DECIMAL(5,2) NOT NULL DEFAULT 0,
  coverage DECIMAL(5,2) NOT NULL DEFAULT 0,
  scope VARCHAR(50) NOT NULL, -- 'subject', 'topic', 'exam', 'global'
  scope_id VARCHAR(255), -- subject name, topic_id, or exam_id if applicable
  time_window VARCHAR(50) NOT NULL, -- '7d', '30d', 'all'
  is_current_user BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scope, scope_id, time_window)
);

-- Create comparison_data table
CREATE TABLE IF NOT EXISTS rp_comparison_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scope VARCHAR(50) NOT NULL,
  scope_id VARCHAR(255),
  time_window VARCHAR(50) NOT NULL,
  you_rank INTEGER,
  you_on_time_rate DECIMAL(5,2),
  you_weekly_minutes INTEGER,
  you_avg_time_per_revision INTEGER,
  you_consistency DECIMAL(5,2),
  you_coverage DECIMAL(5,2),
  topper_rank INTEGER,
  topper_on_time_rate DECIMAL(5,2),
  topper_weekly_minutes INTEGER,
  topper_avg_time_per_revision INTEGER,
  topper_consistency DECIMAL(5,2),
  topper_coverage DECIMAL(5,2),
  average_rank INTEGER,
  average_on_time_rate DECIMAL(5,2),
  average_weekly_minutes INTEGER,
  average_avg_time_per_revision INTEGER,
  average_consistency DECIMAL(5,2),
  average_coverage DECIMAL(5,2),
  struggling_rank INTEGER,
  struggling_on_time_rate DECIMAL(5,2),
  struggling_weekly_minutes INTEGER,
  struggling_avg_time_per_revision INTEGER,
  struggling_consistency DECIMAL(5,2),
  struggling_coverage DECIMAL(5,2),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scope, scope_id, time_window)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rp_leaderboard_scope_window ON rp_leaderboard_entries(scope, time_window, rank);
CREATE INDEX IF NOT EXISTS idx_rp_leaderboard_user ON rp_leaderboard_entries(user_id, scope, time_window);
CREATE INDEX IF NOT EXISTS idx_rp_comparison_user ON rp_comparison_data(user_id, scope, time_window);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rp_leaderboard_entries_updated_at BEFORE UPDATE ON rp_leaderboard_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rp_comparison_data_updated_at BEFORE UPDATE ON rp_comparison_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
