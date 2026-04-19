import pool from "../config/db.js";

export const createReview = async (req, res) => {
  try {
    const { project_id, reviewee_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    // 1. Safety Check: Is the project completed?
    const projectCheck = await pool.query(
      "SELECT status, client_id FROM projects WHERE id = $1", 
      [project_id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = projectCheck.rows[0];

    if (project.status !== 'completed') {
      return res.status(400).json({ message: "You can only review completed projects." });
    }

    if (project.client_id !== reviewer_id) {
      return res.status(403).json({ message: "Only the project owner can leave a review." });
    }

    // 2. Insert the Review
    const result = await pool.query(
      `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [project_id, reviewer_id, reviewee_id, rating, comment]
    );

    res.status(201).json({
      message: "Review submitted successfully!",
      review: result.rows[0]
    });

  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: "You have already reviewed this project." });
    }
    console.error(err);
    res.status(500).json({ message: "Server error while saving review" });
  }
};

// Get reviews for a specific freelancer (for their profile)
export const getFreelancerReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name 
       FROM reviews r 
       JOIN users u ON r.reviewer_id = u.id 
       WHERE r.reviewee_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};