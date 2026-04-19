import pool from "../config/db.js";

// @desc    Get all freelancers for client discovery
// @route   GET /api/users/freelancers
export const getFreelancers = async (req, res) => {
  try {
    const freelancers = await pool.query(
      `SELECT id, name, email, role, skills, about, company, created_at 
       FROM users 
       WHERE role = 'freelancer' 
       ORDER BY created_at DESC`
    );

    res.status(200).json(freelancers.rows);
  } catch (error) {
    console.error("Get Freelancers Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a specific user profile (Freelancer or Client) with Reputation Stats
// @route   GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // We use LEFT JOIN so users with 0 reviews still show up.
    // COALESCE ensures we return 0 instead of NULL for new users.
    const userQuery = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.skills, u.about, u.company, u.created_at,
        COALESCE(AVG(r.rating), 0) AS avg_rating, 
        COUNT(r.id) AS review_count
       FROM users u
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the profile with the new reputation fields
    res.status(200).json(userQuery.rows[0]);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};