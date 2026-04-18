import pool from "../config/db.js";

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      price_min,
      price_max,
      skills_required,
      deadline,
    } = req.body;

    if (!title || !description || !price_min || !price_max || !deadline) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const newProject = await pool.query(
      `INSERT INTO projects 
       (title, description, price_min, price_max, skills_required, deadline, client_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        title,
        description,
        price_min,
        price_max,
        skills_required || null,
        deadline,
        req.user.id,
      ]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get projects for the marketplace (with filters)
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const { minBudget, maxBudget, skills, deadline } = req.query;

    let query = `
      SELECT p.*, u.name as client_name
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let index = 1;

    if (minBudget) {
      query += ` AND p.price_max >= $${index++}`;
      values.push(minBudget);
    }

    if (maxBudget) {
      query += ` AND p.price_min <= $${index++}`;
      values.push(maxBudget);
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
// @route   GET /api/projects/:id
export const getSingleProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await pool.query(
      `SELECT p.*, u.name as client_name
       FROM projects p
       JOIN users u ON p.client_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project.rows[0]);
  } catch (error) {
    console.error("Get Single Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update project status (Owner only)
// @route   PATCH /api/projects/:id/status
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE projects SET status = $1 WHERE id = $2 AND client_id = $3 RETURNING *",
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized or project not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update Project Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get projects belonging to the logged-in client (Dashboard)
// @route   GET /api/projects/my-projects
export const getMyProjects = async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT * FROM projects 
       WHERE client_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(projects.rows);
  } catch (error) {
    console.error("Get My Projects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};