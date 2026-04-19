import pool from "../config/db.js";

export const getClientStats = async (req, res) => {
  try {
    const clientId = req.user.id;

    // 1. Total spent vs Budget Remaining
    const budgetStats = await pool.query(
      `SELECT 
        SUM(price_max) as total_budget,
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
       FROM projects WHERE client_id = $1`,
      [clientId]
    );

    // 2. Project Activity (for a simple bar chart of projects per month)
    const activityStats = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count
       FROM projects 
       WHERE client_id = $1
       GROUP BY month, EXTRACT(MONTH FROM created_at)
       ORDER BY EXTRACT(MONTH FROM created_at)`,
      [clientId]
    );

    res.json({
      summary: budgetStats.rows[0],
      activity: activityStats.rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

export const getFreelancerStats = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    // 1. Earnings over time (Total bid_amount of accepted proposals by month)
    const earningsStats = await pool.query(
      `SELECT TO_CHAR(p.created_at, 'Mon') as month, SUM(pr.bid_amount) as amount
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       WHERE pr.freelancer_id = $1 AND pr.status = 'accepted'
       GROUP BY month, EXTRACT(MONTH FROM p.created_at)
       ORDER BY EXTRACT(MONTH FROM p.created_at)`,
      [freelancerId]
    );

    // 2. Proposal Breakdown (Pending vs Accepted vs Rejected)
    const proposalBreakdown = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM proposals 
       WHERE freelancer_id = $1 
       GROUP BY status`,
      [freelancerId]
    );

    res.json({
      earnings: earningsStats.rows,
      breakdown: proposalBreakdown.rows
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching freelancer stats" });
  }
};