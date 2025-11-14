-- Leaderboard Schema for Revision Planner

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  rank INTEGER NOT NULL,
  on_time_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  weekly_minutes INTEGER NOT NULL DEFAULT 0,
  avg_time_per_revision INTEGER NOT NULL DEFAULT 0,
  consistency DECIMAL(5,2) NOT NULL DEFAULT 0,
  coverage DECIMAL(5,2) NOT NULL DEFAULT 0,
  scope VARCHAR(50) NOT NULL, -- 'global', 'university', 'course'
  scope_id VARCHAR(255), -- university_id or course_id if applicable
  time_window VARCHAR(50) NOT NULL, -- 'week', 'month', 'all'
  is_current_user BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, scope, scope_id, time_window)
);

-- Create comparison_data table
CREATE TABLE IF NOT EXISTS comparison_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL,
  scope_id VARCHAR(255),
  time_window VARCHAR(50) NOT NULL,
  you_on_time_rate DECIMAL(5,2),
  you_weekly_minutes INTEGER,
  topper_on_time_rate DECIMAL(5,2),
  topper_weekly_minutes INTEGER,
  average_on_time_rate DECIMAL(5,2),
  average_weekly_minutes INTEGER,
  struggling_on_time_rate DECIMAL(5,2),
  struggling_weekly_minutes INTEGER,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, scope, scope_id, time_window)
);

-- Create indexes for better query performance
CREATE INDEX idx_leaderboard_scope_window ON leaderboard_entries(scope, time_window, rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id, scope, time_window);
CREATE INDEX idx_comparison_user ON comparison_data(user_id, scope, time_window);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparison_data_updated_at BEFORE UPDATE ON comparison_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
