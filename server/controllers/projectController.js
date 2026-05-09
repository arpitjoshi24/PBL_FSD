import pool from "../config/db.js";

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { title, description, price_min, price_max, skills_required, deadline } = req.body;

    if (!title || !description || !price_min || !price_max || !deadline) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newProject = await pool.query(
      `INSERT INTO projects 
       (title, description, price_min, price_max, skills_required, deadline, client_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
       RETURNING *`,
      [title, description, price_min, price_max, skills_required || null, deadline, req.user.id]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get projects for the marketplace (With Search & Budget Filters)
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const { search, minBudget, maxBudget, skills, deadline } = req.query;

    let query = `
      SELECT p.*, u.name as client_name
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.status = 'open'
    `;

    const values = [];
    let index = 1;

    // --- NEW: Text Search (Matches title or description) ---
    if (search) {
      query += ` AND (p.title ILIKE $${index} OR p.description ILIKE $${index})`;
      values.push(`%${search}%`);
      index++;
    }

    // Filter by Min Budget (Ensures project pays AT LEAST this much)
    if (minBudget) {
      query += ` AND p.price_max >= $${index}::numeric`;
      values.push(minBudget);
      index++;
    }

    // Filter by Max Budget (Ensures project doesn't start HIGHER than this)
    if (maxBudget) {
      query += ` AND p.price_min <= $${index}::numeric`;
      values.push(maxBudget);
      index++;
    }

    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim());
      skillsArray.forEach((skill) => {
        query += ` AND p.skills_required ILIKE $${index++}`;
        values.push(`%${skill}%`);
      });
    }

    if (deadline) {
      query += ` AND p.deadline <= $${index++}`;
      values.push(deadline);
    }

    query += ` ORDER BY p.created_at DESC`;
    const projects = await pool.query(query, values);
    res.status(200).json(projects.rows);

  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a single project's details
export const getSingleProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query(
      `SELECT p.*, u.name as client_name FROM projects p JOIN users u ON p.client_id = u.id WHERE p.id = $1`,
      [id]
    );
    if (project.rows.length === 0) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE projects SET status = $1 WHERE id = $2 AND client_id = $3 RETURNING *",
      [status, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(403).json({ message: "Unauthorized or project not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get client's projects for Dashboard
export const getMyProjects = async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT p.*, r.id as review_id, r.rating as review_rating, r.comment as review_comment,
         u.name as freelancer_name, pr.bid_amount                   
       FROM projects p 
       LEFT JOIN reviews r ON r.project_id = p.id
       LEFT JOIN users u ON p.assigned_to = u.id   
       LEFT JOIN proposals pr ON pr.project_id = p.id AND pr.status = 'accepted' 
       WHERE p.client_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(projects.rows);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get top 3 projects for the Trending Sidebar
export const getTrendingProjects = async (req, res) => {
  try {
    const trending = await pool.query(
      `SELECT id, title, price_max, skills_required FROM projects WHERE status = 'open' ORDER BY created_at DESC LIMIT 3`
    );
    res.status(200).json(trending.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trends" });
  }
};