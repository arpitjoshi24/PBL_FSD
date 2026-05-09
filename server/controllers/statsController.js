import pool from "../config/db.js";

// @desc    Get COO-level Business Intelligence for Client Dashboard
// @route   GET /api/users/stats/client
export const getClientStats = async (req, res) => {
  try {
    const clientId = req.user.id;

    // 1. Financial Intelligence: Actual ROI & Burn Rate
    const financialStats = await pool.query(
      `SELECT 
        SUM(CASE WHEN p.status = 'completed' THEN pr.bid_amount ELSE 0 END) as spent_capital,
        SUM(CASE WHEN p.status = 'assigned' THEN pr.bid_amount ELSE 0 END) as committed_capital,
        COUNT(p.id) as total_projects,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects,
        -- PROJECTED BUDGET: Forecast based on average bids of open projects
        COALESCE((
          SELECT SUM(avg_bid) FROM (
            SELECT AVG(bid_amount) as avg_bid 
            FROM proposals 
            WHERE project_id IN (SELECT id FROM projects WHERE client_id = $1 AND status = 'open')
            GROUP BY project_id
          ) as open_forecast
        ), 0) as projected_budget
       FROM projects p
       LEFT JOIN proposals pr ON p.id = pr.project_id AND pr.status = 'accepted'
       WHERE p.client_id = $1`,
      [clientId]
    );

    // 2. Operational Metrics: Hiring Speed
    const operationalSummary = await pool.query(
      `SELECT 
        -- Time-to-Value: Avg days from Posted -> Assigned
        AVG(EXTRACT(DAY FROM (p.updated_at - p.created_at))) FILTER (WHERE p.status = 'assigned') as avg_hiring_velocity
       FROM projects p
       WHERE p.client_id = $1`,
      [clientId]
    );

    // 3. Talent Network: Preferred Contractors (CRM)
    // Filtered by repeat hires with reliability scoring
    // 3. Talent Network: Preferred Contractors (CRM) with Deep History
    const talentCRM = await pool.query(
      `SELECT 
        u.id as freelancer_id, 
        u.name as freelancer_name,
        u.skills as freelancer_skills,
        COUNT(DISTINCT p.id) as projects_with_them,
        SUM(pr.bid_amount) as total_paid,
        -- Reliability Score
        ROUND(
          (COUNT(CASE WHEN p.status = 'completed' AND p.updated_at <= p.deadline THEN 1 END)::numeric / 
          NULLIF(COUNT(CASE WHEN p.status = 'completed' THEN 1 END), 0)::numeric) * 100
        ) as reliability_score,
        AVG(EXTRACT(DAY FROM (p.updated_at - p.deadline))) FILTER (WHERE p.status = 'completed') as avg_delivery_delta,
        -- Average Rating given by YOU to this freelancer
        AVG(r.rating) as avg_rating,
        -- Aggregate exact project history into a JSON array
        json_agg(
          json_build_object(
            'id', p.id,
            'title', p.title,
            'status', p.status,
            'amount', pr.bid_amount
          )
        ) as project_history
       FROM projects p
       JOIN users u ON p.assigned_to = u.id
       JOIN proposals pr ON p.id = pr.project_id AND pr.freelancer_id = u.id AND pr.status = 'accepted'
       LEFT JOIN reviews r ON r.project_id = p.id AND r.reviewee_id = u.id AND r.reviewer_id = $1
       WHERE p.client_id = $1
       GROUP BY u.id, u.name, u.skills
       HAVING COUNT(DISTINCT p.id) >= 1 
       ORDER BY projects_with_them DESC`,
      [clientId]
    );

    // 4. Funnel Health: Bid Density
    const funnelStats = await pool.query(
      `SELECT 
        p.id, 
        COUNT(pr.id) as proposal_count,
        CASE 
          WHEN COUNT(pr.id) >= 10 THEN 'High Interest'
          WHEN COUNT(pr.id) BETWEEN 5 AND 9 THEN 'Steady'
          ELSE 'Low Density'
        END as health_status
       FROM projects p
       LEFT JOIN proposals pr ON p.id = pr.project_id
       WHERE p.client_id = $1 AND p.status = 'open'
       GROUP BY p.id`,
      [clientId]
    );

    //TIME FRAME DYNAMIC ALLOCATION FOR CAPITAL FLOW
    // Grab the timeframe from the query (default to 'monthly')
    const timeframe = req.query.timeframe || 'monthly';
    
    // Dynamic SQL grouping based on timeframe
    let flowSelect = "";
    let flowGroup = "";
    let flowOrder = "";

    switch (timeframe) {
      case 'daily':
        flowSelect = "TO_CHAR(p.created_at, 'DD Mon') as label";
        flowGroup = "DATE(p.created_at)";
        flowOrder = "DATE(p.created_at)";
        break;
      case 'yearly':
        flowSelect = "TO_CHAR(p.created_at, 'YYYY') as label";
        flowGroup = "EXTRACT(YEAR FROM p.created_at)";
        flowOrder = "EXTRACT(YEAR FROM p.created_at)";
        break;
      case 'overall': // Groups everything into a single timeline progression
        flowSelect = "TO_CHAR(p.created_at, 'Mon YYYY') as label";
        flowGroup = "DATE_TRUNC('month', p.created_at)";
        flowOrder = "DATE_TRUNC('month', p.created_at)";
        break;
      case 'monthly':
      default:
        flowSelect = "TO_CHAR(p.created_at, 'Mon YYYY') as label";
        flowGroup = "DATE_TRUNC('month', p.created_at)";
        flowOrder = "DATE_TRUNC('month', p.created_at)";
        break;
    }

    // 5. Capital Flow: Dynamic Timeline Allocation
    const capitalFlow = await pool.query(
      `SELECT 
        ${flowSelect},
        SUM(CASE WHEN p.status = 'completed' THEN pr.bid_amount ELSE 0 END) as spent,
        SUM(CASE WHEN p.status = 'assigned' THEN pr.bid_amount ELSE 0 END) as committed
       FROM projects p
       LEFT JOIN proposals pr ON p.id = pr.project_id AND pr.status = 'accepted'
       WHERE p.client_id = $1
       GROUP BY ${flowGroup}, label
       ORDER BY ${flowOrder} ASC`,
      [clientId]
    );

    res.json({
      funnel: funnelStats.rows,
      // CRITICAL FIX: Merge both summaries into one object for the frontend
      summary: { 
        ...financialStats.rows[0], 
        ...operationalSummary.rows[0] 
      },
      talent: talentCRM.rows,
      flow: capitalFlow.rows,
      activity: capitalFlow.rows
    });
  } catch (err) {
    console.error("COO Stats Error:", err);
    res.status(500).json({ message: "Error fetching executive dashboard metrics" });
  }
};

// @desc    Get comprehensive stats for Freelancer Dashboard
// @route   GET /api/users/stats/freelancer
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

    // 3. Client Network / History (NEW)
    // Grabs the clients they have worked for, counts completed projects, and sums total earned per client
    // 3. The Client Roster & History (DEEP CRM DATA)
    const clientsData = await pool.query(
      `SELECT u.id as client_id, u.name as client_name, u.company,
              COUNT(DISTINCT CASE WHEN p.status = 'completed' AND pr.status = 'accepted' THEN p.id END) as projects_completed,
              SUM(CASE WHEN pr.status = 'accepted' THEN pr.bid_amount ELSE 0 END) as total_earned,
              COUNT(DISTINCT CASE WHEN pr.status = 'rejected' THEN pr.id END) as rejected_bids,
              AVG(r.rating) as client_avg_rating
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       JOIN users u ON p.client_id = u.id
       LEFT JOIN reviews r ON r.project_id = p.id AND r.reviewee_id = $1 AND r.reviewer_id = u.id
       WHERE pr.freelancer_id = $1
       GROUP BY u.id, u.name, u.company
       ORDER BY total_earned DESC`,
      [freelancerId]
    );
    
    // 4. Tech Stack Proficiency Analysis (NEW)
    // Grabs all skills from completed projects
    const projectsData = await pool.query(
      `SELECT skills_required 
       FROM projects 
       WHERE assigned_to = $1 AND status = 'completed'`,
      [freelancerId]
    );

    // Calculate the Tech Stack Tally in JavaScript
    const techTally = {};
    projectsData.rows.forEach(row => {
      if (row.skills_required) {
        // Split by comma, trim whitespace, and make lowercase for consistency
        const skills = row.skills_required.split(",").map(s => s.trim().toLowerCase());
        skills.forEach(skill => {
          techTally[skill] = (techTally[skill] || 0) + 1;
        });
      }
    });

    // Convert tally object to an array formatted for frontend charts: [{name: 'react', value: 3}]
    const techStack = Object.keys(techTally).map(key => ({
      name: key,
      value: techTally[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Return only the Top 5 most used skills

    // 5. Send it all to the frontend
    res.json({
      earnings: earningsStats.rows,
      breakdown: proposalBreakdown.rows,
      clients: clientsData.rows,
      techStack: techStack
    });

  } catch (err) {
    console.error("Freelancer Stats Error:", err);
    res.status(500).json({ message: "Error fetching freelancer stats" });
  }
};