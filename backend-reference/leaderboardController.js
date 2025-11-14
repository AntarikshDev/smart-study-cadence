// Leaderboard Controller for Revision Planner Backend
// Works with rp_sessions, rp_topics, and rp_schedule tables

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your database connection

/**
 * Calculate leaderboard metrics for a user based on rp_sessions and rp_schedule
 */
const calculateUserMetrics = async (userId, timeWindow, scope = 'subject', scopeId = null) => {
  const intervalDays = timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : 365;
  
  const scopeFilter = scope === 'subject' && scopeId 
    ? `AND t.subject = $3` 
    : scope === 'topic' && scopeId 
    ? `AND t.id = $3::uuid` 
    : '';
  
  const params = [userId, intervalDays];
  if (scopeId && scope !== 'global') params.push(scopeId);

  const { rows } = await pool.query(`
    WITH session_data AS (
      SELECT 
        s.id,
        s.topic_id,
        s.schedule_id,
        s.started_at,
        s.finished_at,
        s.actual_seconds,
        sc.due_on,
        sc.status,
        t.subject
      FROM rp_sessions s
      JOIN rp_topics t ON s.topic_id = t.id
      LEFT JOIN rp_schedule sc ON s.schedule_id = sc.id
      WHERE s.user_id = $1
        AND s.started_at >= NOW() - INTERVAL '1 day' * $2
        AND s.finished_at IS NOT NULL
        ${scopeFilter}
    ),
    metrics AS (
      SELECT
        -- On-time rate: sessions completed by or before due date
        COUNT(*) FILTER (
          WHERE schedule_id IS NOT NULL 
          AND finished_at IS NOT NULL 
          AND DATE(finished_at) <= due_on
        ) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE schedule_id IS NOT NULL AND finished_at IS NOT NULL), 0) as on_time_rate,
        
        -- Total minutes studied
        COALESCE(SUM(actual_seconds) / 60.0, 0) as total_minutes,
        
        -- Average time per revision in minutes
        COALESCE(AVG(actual_seconds) / 60.0, 0) as avg_time_per_revision,
        
        -- Consistency: percentage of days with at least one session
        COUNT(DISTINCT DATE(started_at)) * 100.0 / $2 as consistency,
        
        -- Coverage: percentage of topics studied
        COUNT(DISTINCT topic_id) * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM rp_topics WHERE user_id = $1 AND is_archived = FALSE ${scopeFilter.replace('t.', '')}), 0) as coverage
      FROM session_data
    )
    SELECT 
      COALESCE(on_time_rate, 0)::numeric(5,2) as on_time_rate,
      COALESCE(total_minutes, 0)::integer as weekly_minutes,
      COALESCE(avg_time_per_revision, 0)::integer as avg_time_per_revision,
      COALESCE(consistency, 0)::numeric(5,2) as consistency,
      COALESCE(coverage, 0)::numeric(5,2) as coverage
    FROM metrics
  `, params);

  return rows[0];
};

/**
 * Get leaderboard entries
 * GET /leaderboard/leaderboard?scope=subject&window=30d
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { scope = 'subject', window = '30d', scopeId = null } = req.query;
    const userId = req.user?.id || 1; // Mock user ID for testing

    // Get all active users
    const { rows: users } = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.avatar_url 
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM rp_sessions s WHERE s.user_id = u.id
      )
    `);

    const leaderboardData = [];

    // Calculate metrics for each user
    for (const user of users) {
      const metrics = await calculateUserMetrics(user.id, window, scope, scopeId);
      
      leaderboardData.push({
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        onTimeRate: parseFloat(metrics.on_time_rate) || 0,
        weeklyMinutes: parseInt(metrics.weekly_minutes) || 0,
        avgTimePerRevision: parseInt(metrics.avg_time_per_revision) || 0,
        consistency: parseFloat(metrics.consistency) || 0,
        coverage: parseFloat(metrics.coverage) || 0,
        isCurrentUser: user.id === userId,
      });
    }

    // Sort by on_time_rate and assign ranks
    leaderboardData.sort((a, b) => b.onTimeRate - a.onTimeRate);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Store in database for caching
    for (const entry of leaderboardData) {
      await pool.query(`
        INSERT INTO rp_leaderboard_entries 
        (user_id, username, avatar_url, rank, on_time_rate, weekly_minutes, 
         avg_time_per_revision, consistency, coverage, scope, scope_id, time_window, is_current_user)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id, scope, scope_id, time_window) 
        DO UPDATE SET 
          rank = $4,
          on_time_rate = $5,
          weekly_minutes = $6,
          avg_time_per_revision = $7,
          consistency = $8,
          coverage = $9,
          is_current_user = $13,
          calculated_at = now(),
          updated_at = now()
      `, [
        entry.id, entry.name, entry.avatar_url, entry.rank,
        entry.onTimeRate, entry.weeklyMinutes, entry.avgTimePerRevision,
        entry.consistency, entry.coverage, scope, scopeId, window, entry.isCurrentUser
      ]);
    }

    res.json(leaderboardData);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get comparison data
 * GET /leaderboard/comparison?scope=subject&id=current-user&window=30d
 */
router.get('/comparison', async (req, res) => {
  try {
    const { scope = 'subject', id = 'current-user', window = '30d', scopeId = null } = req.query;
    const userId = id === 'current-user' ? (req.user?.id || 1) : id;

    console.log('Comparison Params:', { scope, id, window, userId, scopeId });

    // Get current user metrics
    const userMetrics = await calculateUserMetrics(userId, window, scope, scopeId);

    // Get all users metrics for comparison
    const { rows: allUsers } = await pool.query(`
      SELECT DISTINCT user_id as id 
      FROM rp_sessions 
      WHERE finished_at IS NOT NULL
    `);

    const allMetrics = [];
    for (const user of allUsers) {
      const metrics = await calculateUserMetrics(user.id, window, scope, scopeId);
      allMetrics.push({
        ...metrics,
        user_id: user.id
      });
    }

    // Calculate ranks and comparison data
    const sortedByOnTime = [...allMetrics].sort((a, b) => 
      (parseFloat(b.on_time_rate) || 0) - (parseFloat(a.on_time_rate) || 0)
    );
    
    // Find user rank
    const userRank = sortedByOnTime.findIndex(m => m.user_id === userId) + 1;
    
    // Topper (rank 1)
    const topper = sortedByOnTime[0] || {};
    
    // Bottom 25% for "struggling" average
    const bottom25Percent = sortedByOnTime.slice(Math.floor(sortedByOnTime.length * 0.75));
    
    // Calculate averages
    const avgOnTimeRate = allMetrics.reduce((sum, m) => 
      sum + (parseFloat(m.on_time_rate) || 0), 0) / allMetrics.length;
    const avgWeeklyMinutes = allMetrics.reduce((sum, m) => 
      sum + (parseInt(m.weekly_minutes) || 0), 0) / allMetrics.length;
    const avgTimePerRevision = allMetrics.reduce((sum, m) => 
      sum + (parseInt(m.avg_time_per_revision) || 0), 0) / allMetrics.length;
    const avgConsistency = allMetrics.reduce((sum, m) => 
      sum + (parseFloat(m.consistency) || 0), 0) / allMetrics.length;
    const avgCoverage = allMetrics.reduce((sum, m) => 
      sum + (parseFloat(m.coverage) || 0), 0) / allMetrics.length;
    
    // Struggling averages
    const strugglingOnTimeRate = bottom25Percent.reduce((sum, m) => 
      sum + (parseFloat(m.on_time_rate) || 0), 0) / bottom25Percent.length;
    const strugglingWeeklyMinutes = bottom25Percent.reduce((sum, m) => 
      sum + (parseInt(m.weekly_minutes) || 0), 0) / bottom25Percent.length;
    const strugglingTimePerRevision = bottom25Percent.reduce((sum, m) => 
      sum + (parseInt(m.avg_time_per_revision) || 0), 0) / bottom25Percent.length;
    const strugglingConsistency = bottom25Percent.reduce((sum, m) => 
      sum + (parseFloat(m.consistency) || 0), 0) / bottom25Percent.length;
    const strugglingCoverage = bottom25Percent.reduce((sum, m) => 
      sum + (parseFloat(m.coverage) || 0), 0) / bottom25Percent.length;

    const comparisonResult = {
      you: {
        rank: userRank,
        onTimeRate: parseFloat(userMetrics.on_time_rate) || 0,
        weeklyMinutes: parseInt(userMetrics.weekly_minutes) || 0,
        avgTimePerRevision: parseInt(userMetrics.avg_time_per_revision) || 0,
        consistency: parseFloat(userMetrics.consistency) || 0,
        coverage: parseFloat(userMetrics.coverage) || 0,
      },
      topper: {
        rank: 1,
        onTimeRate: parseFloat(topper.on_time_rate) || 0,
        weeklyMinutes: parseInt(topper.weekly_minutes) || 0,
        avgTimePerRevision: parseInt(topper.avg_time_per_revision) || 0,
        consistency: parseFloat(topper.consistency) || 0,
        coverage: parseFloat(topper.coverage) || 0,
      },
      average: {
        rank: Math.round(allMetrics.length / 2),
        onTimeRate: Math.round(avgOnTimeRate),
        weeklyMinutes: Math.round(avgWeeklyMinutes),
        avgTimePerRevision: Math.round(avgTimePerRevision),
        consistency: Math.round(avgConsistency),
        coverage: Math.round(avgCoverage),
      },
      struggling: {
        rank: sortedByOnTime.length,
        onTimeRate: Math.round(strugglingOnTimeRate),
        weeklyMinutes: Math.round(strugglingWeeklyMinutes),
        avgTimePerRevision: Math.round(strugglingTimePerRevision),
        consistency: Math.round(strugglingConsistency),
        coverage: Math.round(strugglingCoverage),
      },
    };

    // Store in database
    await pool.query(`
      INSERT INTO rp_comparison_data 
      (user_id, scope, scope_id, time_window, 
       you_rank, you_on_time_rate, you_weekly_minutes, you_avg_time_per_revision, you_consistency, you_coverage,
       topper_rank, topper_on_time_rate, topper_weekly_minutes, topper_avg_time_per_revision, topper_consistency, topper_coverage,
       average_rank, average_on_time_rate, average_weekly_minutes, average_avg_time_per_revision, average_consistency, average_coverage,
       struggling_rank, struggling_on_time_rate, struggling_weekly_minutes, struggling_avg_time_per_revision, struggling_consistency, struggling_coverage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      ON CONFLICT (user_id, scope, scope_id, time_window)
      DO UPDATE SET
        you_rank = $5, you_on_time_rate = $6, you_weekly_minutes = $7, you_avg_time_per_revision = $8, you_consistency = $9, you_coverage = $10,
        topper_rank = $11, topper_on_time_rate = $12, topper_weekly_minutes = $13, topper_avg_time_per_revision = $14, topper_consistency = $15, topper_coverage = $16,
        average_rank = $17, average_on_time_rate = $18, average_weekly_minutes = $19, average_avg_time_per_revision = $20, average_consistency = $21, average_coverage = $22,
        struggling_rank = $23, struggling_on_time_rate = $24, struggling_weekly_minutes = $25, struggling_avg_time_per_revision = $26, struggling_consistency = $27, struggling_coverage = $28,
        calculated_at = now(), updated_at = now()
    `, [
      userId, scope, scopeId, window,
      comparisonResult.you.rank, comparisonResult.you.onTimeRate, comparisonResult.you.weeklyMinutes, comparisonResult.you.avgTimePerRevision, comparisonResult.you.consistency, comparisonResult.you.coverage,
      comparisonResult.topper.rank, comparisonResult.topper.onTimeRate, comparisonResult.topper.weeklyMinutes, comparisonResult.topper.avgTimePerRevision, comparisonResult.topper.consistency, comparisonResult.topper.coverage,
      comparisonResult.average.rank, comparisonResult.average.onTimeRate, comparisonResult.average.weeklyMinutes, comparisonResult.average.avgTimePerRevision, comparisonResult.average.consistency, comparisonResult.average.coverage,
      comparisonResult.struggling.rank, comparisonResult.struggling.onTimeRate, comparisonResult.struggling.weeklyMinutes, comparisonResult.struggling.avgTimePerRevision, comparisonResult.struggling.consistency, comparisonResult.struggling.coverage
    ]);

    res.json(comparisonResult);
  } catch (err) {
    console.error('Comparison Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch comparison data', error: err.message });
  }
});

module.exports = router;

/**
 * Routes setup in your main Express app:
 * 
 * const leaderboardRouter = require('./routes/leaderboard');
 * app.use('/leaderboard', leaderboardRouter);
 * 
 * Available endpoints:
 * GET /leaderboard/leaderboard?scope=subject&window=30d
 * GET /leaderboard/comparison?scope=subject&id=current-user&window=30d
 */
