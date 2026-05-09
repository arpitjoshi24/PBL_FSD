import pool from "../config/db.js";

// @desc    Send a direct invite to a freelancer
// @route   POST /api/invites
export const sendInvite = async (req, res) => {
  try {
    const { project_id, freelancer_id } = req.body;

    // Insert invite (Handles UNIQUE constraint error nicely)
    const invite = await pool.query(
      `INSERT INTO project_invites (project_id, client_id, freelancer_id, status) 
       VALUES ($1, $2, $3, 'open') 
       ON CONFLICT (project_id, freelancer_id) DO NOTHING 
       RETURNING *`,
      [project_id, req.user.id, freelancer_id]
    );

    if (invite.rows.length === 0) {
      return res.status(400).json({ message: "Invite already sent for this project." });
    }

    res.status(201).json(invite.rows[0]);
  } catch (error) {
    console.error("Send Invite Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Client's Sent Invites
// @route   GET /api/invites/client
export const getClientInvites = async (req, res) => {
  try {
    const invites = await pool.query(
      `SELECT i.*, p.title as project_title, u.name as freelancer_name 
       FROM project_invites i
       JOIN projects p ON i.project_id = p.id
       JOIN users u ON i.freelancer_id = u.id
       WHERE i.client_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(invites.rows);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Freelancer's Received Invites (With Dynamic State Engine)
// @route   GET /api/invites/freelancer
export const getFreelancerInvites = async (req, res) => {
  try {
    const invites = await pool.query(
      `SELECT i.*, p.title as project_title, u.name as client_name, p.price_min, p.price_max,
       CASE 
         WHEN i.status = 'expired' THEN 'Invite Expired'
         WHEN i.status = 'rejected' THEN 'Rejected'
         WHEN i.status = 'open' THEN 'Invited'
         WHEN i.status = 'accepted' THEN 
           CASE 
             WHEN p.status = 'assigned' AND p.assigned_to = i.freelancer_id THEN 'Project Assigned'
             WHEN p.status = 'assigned' AND p.assigned_to != i.freelancer_id THEN 'Not Hired'
             ELSE 'Accepted'
           END
       END as dynamic_status
       FROM project_invites i
       JOIN projects p ON i.project_id = p.id
       JOIN users u ON i.client_id = u.id
       WHERE i.freelancer_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(invites.rows);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update Invite Status (Expire or Reject)
// @route   PATCH /api/invites/:id/status
export const updateInviteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'expired' (by client) or 'rejected' (by freelancer)

    const updated = await pool.query(
      "UPDATE project_invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};