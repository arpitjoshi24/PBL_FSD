import pool from "../config/db.js";

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

    // ✅ Proper budget overlap logic
    if (minBudget) {
      query += ` AND p.price_max >= $${index++}`;
      values.push(minBudget);
    }

    if (maxBudget) {
      query += ` AND p.price_min <= $${index++}`;
      values.push(maxBudget);
    }

    // ✅ Skills filtering (multiple skills supported)
    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim());

      skillsArray.forEach((skill) => {
        query += ` AND p.skills_required ILIKE $${index++}`;
        values.push(`%${skill}%`);
      });
    }

    // ✅ Deadline filter
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