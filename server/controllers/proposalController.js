import pool from "../config/db.js";

// @desc    Create a new proposal (Bid)
// @route   POST /api/proposals
export const createProposal = async (req, res) => {
  try {
    const { project_id, bid_amount, delivery_days, cover_letter } = req.body;

    // Check for all fields including the new delivery_days
    if (!project_id || !bid_amount || !delivery_days || !cover_letter) {
      return res.status(400).json({
        message: "All fields (project, bid, delivery time, and letter) are required",
      });
    }

    const proposal = await pool.query(
      `INSERT INTO proposals 
      (project_id, freelancer_id, bid_amount, delivery_days, cover_letter) -- FIXED
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [project_id, req.user.id, bid_amount, delivery_days, cover_letter]
    );

    // If this proposal came from an invite, mark the invite as 'accepted'
    await pool.query(
      `UPDATE project_invites 
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
       WHERE project_id = $1 AND freelancer_id = $2 AND status = 'open'`,
      [project_id, req.user.id]
    );

    res.status(201).json(proposal.rows[0]);
  } catch (error) {
    console.error("Create Proposal Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all proposals for a specific project (Owner Only)
// @route   GET /api/proposals/projects/:projectId
export const getProjectProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectCheck = await pool.query(
      "SELECT client_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (projectCheck.rows[0].client_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view these proposals" });
    }

    // Selecting pr.* includes the new delivery_days automatically
    const proposals = await pool.query(
      `SELECT pr.*, u.name as freelancer_name, u.email as freelancer_email 
       FROM proposals pr
       JOIN users u ON pr.freelancer_id = u.id
       WHERE pr.project_id = $1
       ORDER BY pr.created_at DESC`,
      [projectId]
    );

    res.status(200).json(proposals.rows);
  } catch (error) {
    console.error("Get Project Proposals Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Accept a proposal and assign project
// @route   PATCH /api/proposals/:id/accept
export const acceptProposal = async (req, res) => {
  const { id } = req.params; // The Proposal ID

  try {
    // 1. Fetch proposal details to get the project_id and freelancer_id
    const proposalData = await pool.query(
      `SELECT pr.*, p.client_id 
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       WHERE pr.id = $1`,
      [id]
    );

    if (proposalData.rows.length === 0) return res.status(404).json({ message: "Proposal not found" });
    const proposal = proposalData.rows[0];

    if (proposal.client_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    await pool.query("BEGIN");

    // 2. Mark this proposal as accepted
    await pool.query("UPDATE proposals SET status = 'accepted' WHERE id = $1", [id]);

    // 3. Reject other proposals for this project
    await pool.query("UPDATE proposals SET status = 'rejected' WHERE project_id = $1 AND id != $2", [proposal.project_id, id]);

    // 4. Update the project: Mark as assigned AND store the freelancer's ID
    await pool.query(
      "UPDATE projects SET status = 'assigned', assigned_to = $1 WHERE id = $2",
      [proposal.freelancer_id, proposal.project_id]
    );

    await pool.query("COMMIT");
    res.status(200).json({ message: "Project assigned successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get current user's (Freelancer) proposals
// @route   GET /api/proposals/my-proposals
export const getMyProposals = async (req, res) => {
  try {
    const proposals = await pool.query(
      `SELECT 
        pr.id, pr.bid_amount, pr.delivery_days, pr.status as current_proposal_status, pr.created_at as proposal_date,
        pr.cover_letter, -- FIXED: Changed from cover_text to match your schema
        p.id as project_id, p.title as project_title, p.status as current_project_status, p.skills_required, p.deadline, p.updated_at as project_updated_at,
        u.id as client_id, u.name as client_name
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       JOIN users u ON p.client_id = u.id
       WHERE pr.freelancer_id = $1
       ORDER BY pr.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(proposals.rows);
  } catch (error) {
    console.error("Get My Proposals Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};