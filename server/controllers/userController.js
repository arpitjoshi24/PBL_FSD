import pool from "../config/db.js";

// @desc    Get all freelancers for client discovery
// @route   GET /api/users/freelancers
export const getFreelancers = async (req, res) => {
  try {
    const freelancers = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.skills, u.about, u.company, u.created_at,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
       FROM users u
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.role = 'freelancer' 
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.status(200).json(freelancers.rows);
  } catch (error) {
    console.error("Get Freelancers Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a specific user profile with Reputation Stats & Heatmap Data
// @route   GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined" || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid User ID provided." });
    }

    // UPDATED QUERY: Added contribution_dates for the Heatmap
    const userQuery = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.skills, u.about, u.company, u.created_at,
        COALESCE(AVG(r.rating), 0) AS avg_rating, 
        COUNT(r.id) AS review_count,
        (
          SELECT json_agg(updated_at) 
          FROM projects 
          WHERE assigned_to = u.id AND status = 'completed'
        ) AS contribution_dates
       FROM users u
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let userData = userQuery.rows[0];

    // TECH STACK LOGIC
    if (userData.role === 'freelancer') {
      const projectsData = await pool.query(
        `SELECT skills_required FROM projects WHERE assigned_to = $1 AND status = 'completed'`,
        [id]
      );

      const techTally = {};
      projectsData.rows.forEach(row => {
        if (row.skills_required) {
          const skills = row.skills_required.split(",").map(s => s.trim().toLowerCase());
          skills.forEach(skill => {
            techTally[skill] = (techTally[skill] || 0) + 1;
          });
        }
      });

      userData.techStack = Object.keys(techTally).map(key => ({
        name: key,
        value: techTally[key]
      })).sort((a, b) => b.value - a.value).slice(0, 5);
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};