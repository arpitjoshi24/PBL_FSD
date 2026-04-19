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

// @desc    Get a specific user profile (Freelancer or Client)
// @route   GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query(
      "SELECT id, name, email, role, skills, about, company, created_at FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};