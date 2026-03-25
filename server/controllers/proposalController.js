import pool from "../config/db.js";

export const createProposal = async (req, res) => {
  try {
    const { project_id, bid_amount, cover_letter } = req.body;

    if (!project_id || !bid_amount || !cover_letter) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const proposal = await pool.query(
      `INSERT INTO proposals 
      (project_id, freelancer_id, bid_amount, cover_letter)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [
        project_id,
        req.user.id,
        bid_amount,
        cover_letter,
      ]
    );

    res.status(201).json(proposal.rows[0]);

  } catch (error) {
    console.error("Create Proposal Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};