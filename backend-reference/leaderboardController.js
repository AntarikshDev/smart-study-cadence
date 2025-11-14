// Leaderboard Controller for Revision Planner Backend

const pool = require('../config/database'); // Your database connection

/**
 * Calculate leaderboard metrics for a user
 */
const calculateUserMetrics = async (userId, timeWindow) => {
  const { rows } = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE rs.completed_at IS NOT NULL AND rs.completed_at <= rs.due_date) * 100.0 / 
        NULLIF(COUNT(*) FILTER (WHERE rs.completed_at IS NOT NULL), 0) as on_time_rate,
      COALESCE(SUM(EXTRACT(EPOCH FROM (rs.ended_at - rs.started_at)) / 60), 0) as weekly_minutes,
      COALESCE(AVG(EXTRACT(EPOCH FROM (rs.ended_at - rs.started_at)) / 60), 0) as avg_time_per_revision,
      COUNT(DISTINCT DATE(rs.started_at)) * 100.0 / 7 as consistency,
      COUNT(DISTINCT t.id) * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM topics WHERE user_id = $1), 0) as coverage
    FROM revision_sessions rs
    JOIN topics t ON rs.topic_id = t.id
    WHERE rs.user_id = $1
      AND rs.started_at >= NOW() - INTERVAL '${timeWindow === 'week' ? '7 days' : timeWindow === 'month' ? '30 days' : '10 years'}'
  `, [userId]);

  return rows[0];
};

/**
 * Get leaderboard entries
 * GET /api/leaderboard?scope=global&window=week
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { scope = 'global', window = 'week' } = req.query;
    const userId = req.user?.id; // From auth middleware

    // Calculate leaderboard for all users
    const { rows: users } = await pool.query(`
      SELECT id, username, avatar_url FROM users
      WHERE is_active = true
    `);

    const leaderboardData = [];

    for (const user of users) {
      const metrics = await calculateUserMetrics(user.id, window);
      
      leaderboardData.push({
        user_id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        on_time_rate: parseFloat(metrics.on_time_rate) || 0,
        weekly_minutes: parseInt(metrics.weekly_minutes) || 0,
        avg_time_per_revision: parseInt(metrics.avg_time_per_revision) || 0,
        consistency: parseFloat(metrics.consistency) || 0,
        coverage: parseFloat(metrics.coverage) || 0,
        is_current_user: user.id === userId,
      });
    }

    // Sort by on_time_rate and assign ranks
    leaderboardData.sort((a, b) => b.on_time_rate - a.on_time_rate);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Store in database
    for (const entry of leaderboardData) {
      await pool.query(`
        INSERT INTO leaderboard_entries 
        (user_id, username, avatar_url, rank, on_time_rate, weekly_minutes, 
         avg_time_per_revision, consistency, coverage, scope, time_window, is_current_user)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id, scope, scope_id, time_window) 
        DO UPDATE SET 
          rank = $4,
          on_time_rate = $5,
          weekly_minutes = $6,
          avg_time_per_revision = $7,
          consistency = $8,
          coverage = $9,
          is_current_user = $12,
          calculated_at = CURRENT_TIMESTAMP
      `, [
        entry.user_id, entry.username, entry.avatar_url, entry.rank,
        entry.on_time_rate, entry.weekly_minutes, entry.avg_time_per_revision,
        entry.consistency, entry.coverage, scope, window, entry.is_current_user
      ]);
    }

    res.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
};

/**
 * Get comparison data
 * GET /api/comparison?scope=global&id=user_id&window=week
 */
exports.getComparison = async (req, res) => {
  try {
    const { scope = 'global', id, window = 'week' } = req.query;
    const userId = id || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get current user metrics
    const userMetrics = await calculateUserMetrics(userId, window);

    // Get all users metrics for comparison
    const { rows: allUsers } = await pool.query(`
      SELECT id FROM users WHERE is_active = true
    `);

    const allMetrics = [];
    for (const user of allUsers) {
      const metrics = await calculateUserMetrics(user.id, window);
      allMetrics.push(metrics);
    }

    // Calculate comparison data
    const sortedByOnTime = [...allMetrics].sort((a, b) => 
      (parseFloat(b.on_time_rate) || 0) - (parseFloat(a.on_time_rate) || 0)
    );
    
    const topper = sortedByOnTime[0];
    const bottom25Percent = sortedByOnTime.slice(Math.floor(sortedByOnTime.length * 0.75));
    
    const avgOnTimeRate = allMetrics.reduce((sum, m) => 
      sum + (parseFloat(m.on_time_rate) || 0), 0) / allMetrics.length;
    const avgWeeklyMinutes = allMetrics.reduce((sum, m) => 
      sum + (parseInt(m.weekly_minutes) || 0), 0) / allMetrics.length;
    
    const strugglingOnTimeRate = bottom25Percent.reduce((sum, m) => 
      sum + (parseFloat(m.on_time_rate) || 0), 0) / bottom25Percent.length;
    const strugglingWeeklyMinutes = bottom25Percent.reduce((sum, m) => 
      sum + (parseInt(m.weekly_minutes) || 0), 0) / bottom25Percent.length;

    const comparisonData = {
      you_on_time_rate: parseFloat(userMetrics.on_time_rate) || 0,
      you_weekly_minutes: parseInt(userMetrics.weekly_minutes) || 0,
      topper_on_time_rate: parseFloat(topper.on_time_rate) || 0,
      topper_weekly_minutes: parseInt(topper.weekly_minutes) || 0,
      average_on_time_rate: avgOnTimeRate,
      average_weekly_minutes: Math.round(avgWeeklyMinutes),
      struggling_on_time_rate: strugglingOnTimeRate,
      struggling_weekly_minutes: Math.round(strugglingWeeklyMinutes),
    };

    // Store in database
    await pool.query(`
      INSERT INTO comparison_data 
      (user_id, scope, time_window, you_on_time_rate, you_weekly_minutes,
       topper_on_time_rate, topper_weekly_minutes, average_on_time_rate,
       average_weekly_minutes, struggling_on_time_rate, struggling_weekly_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, scope, scope_id, time_window)
      DO UPDATE SET
        you_on_time_rate = $4,
        you_weekly_minutes = $5,
        topper_on_time_rate = $6,
        topper_weekly_minutes = $7,
        average_on_time_rate = $8,
        average_weekly_minutes = $9,
        struggling_on_time_rate = $10,
        struggling_weekly_minutes = $11,
        calculated_at = CURRENT_TIMESTAMP
    `, [
      userId, scope, window,
      comparisonData.you_on_time_rate, comparisonData.you_weekly_minutes,
      comparisonData.topper_on_time_rate, comparisonData.topper_weekly_minutes,
      comparisonData.average_on_time_rate, comparisonData.average_weekly_minutes,
      comparisonData.struggling_on_time_rate, comparisonData.struggling_weekly_minutes
    ]);

    res.json(comparisonData);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
};

/**
 * Get cached leaderboard (faster endpoint)
 * GET /api/leaderboard/cached?scope=global&window=week
 */
exports.getCachedLeaderboard = async (req, res) => {
  try {
    const { scope = 'global', window = 'week' } = req.query;
    const userId = req.user?.id;

    const { rows } = await pool.query(`
      SELECT * FROM leaderboard_entries
      WHERE scope = $1 AND time_window = $2
      ORDER BY rank ASC
    `, [scope, window]);

    // Mark current user
    const leaderboard = rows.map(entry => ({
      ...entry,
      is_current_user: entry.user_id === userId
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching cached leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch cached leaderboard' });
  }
};

/**
 * Routes to add in your Express router:
 * 
 * const leaderboardController = require('./controllers/leaderboardController');
 * const authMiddleware = require('./middleware/auth');
 * 
 * router.get('/leaderboard', authMiddleware, leaderboardController.getLeaderboard);
 * router.get('/leaderboard/cached', authMiddleware, leaderboardController.getCachedLeaderboard);
 * router.get('/comparison', authMiddleware, leaderboardController.getComparison);
 */
