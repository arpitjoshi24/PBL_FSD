import pool from "../config/db.js";

// @desc    Create a new proposal
// @route   POST /api/proposals
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
      [project_id, req.user.id, bid_amount, cover_letter]
    );

    res.status(201).json(proposal.rows[0]);
  } catch (error) {
    console.error("Create Proposal Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all proposals for a specific project (Owner Only)
// @route   GET /api/proposals/project/:projectId
export const getProjectProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify the requester is the owner of the project
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
  try {
    const { id } = req.params; // Proposal ID

    // 1. Fetch proposal and project owner info
    const proposalData = await pool.query(
      `SELECT pr.*, p.client_id 
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       WHERE pr.id = $1`,
      [id]
    );

    if (proposalData.rows.length === 0) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const proposal = proposalData.rows[0];

    // 2. Verify authorization
    if (proposal.client_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to accept this proposal" });
    }

    // 3. Update Proposal and Project status (Transaction)
    await pool.query("BEGIN");

    // Accept this proposal
    await pool.query(
      "UPDATE proposals SET status = 'accepted' WHERE id = $1",
      [id]
    );

    // Reject all other proposals for this project
    await pool.query(
      "UPDATE proposals SET status = 'rejected' WHERE project_id = $1 AND id != $2",
      [proposal.project_id, id]
    );

    // Mark project as assigned
    await pool.query(
      "UPDATE projects SET status = 'assigned' WHERE id = $1",
      [proposal.project_id]
    );

    await pool.query("COMMIT");

    res.status(200).json({ message: "Proposal accepted and project assigned" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Accept Proposal Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const proposals = await pool.query(
      `SELECT 
        pr.id, 
        pr.bid_amount, 
        pr.status as proposal_status, 
        pr.created_at,
        p.id as project_id,
        p.title as project_title, 
        p.status as current_project_status
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
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