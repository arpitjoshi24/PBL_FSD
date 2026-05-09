import pool from "../config/db.js";

// @desc    Create or Update a Review
// @route   POST /api/reviews
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

    // 2. Upsert Logic: Check if review already exists
    const existing = await pool.query(
      "SELECT id FROM reviews WHERE project_id = $1 AND reviewer_id = $2", 
      [project_id, reviewer_id]
    );

    if (existing.rows.length > 0) {
      // Edit Review (Update)
      const updated = await pool.query(
        "UPDATE reviews SET rating = $1, comment = $2 WHERE project_id = $3 RETURNING *",
        [rating, comment, project_id]
      );
      
      return res.status(200).json({
        message: "Review updated successfully!",
        review: updated.rows[0]
      });
    } else {
      // New Review (Insert)
      const newReview = await pool.query(
        `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [project_id, reviewer_id, reviewee_id, rating, comment]
      );
      
      return res.status(201).json({
        message: "Review submitted successfully!",
        review: newReview.rows[0]
      });
    }

  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Server error while saving review" });
  }
};

// @desc    Get all reviews for a freelancer (Enriched with Client & Project Data)
// @route   GET /api/reviews/freelancer/:id
export const getFreelancerReviews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Enriched query pulling in project title, required skills, and the client's name
    const result = await pool.query(
      `SELECT r.*, 
        p.title as project_title, 
        p.skills_required as project_skills, 
        u.name as client_name
       FROM reviews r
       JOIN projects p ON r.project_id = p.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fetch Reviews Error:", err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};