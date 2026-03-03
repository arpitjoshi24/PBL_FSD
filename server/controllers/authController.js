import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, skills, company, about } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users 
       (name, email, password, role, skills, company, about) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, email, role, skills, company, about`,
      [
        name,
        email,
        hashedPassword,
        role,
        skills || null,
        company || null,
        about || null,
      ]
    );

    const user = newUser.rows[0];

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      user,
      token,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* =======================================================
   LOGIN CONTROLLER
======================================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // Get user
    const userData = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userData.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = userData.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        company: user.company,
        about: user.about,
      },
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* =======================================================
   GET CURRENT USER (/me)
======================================================= */
export const getMe = async (req, res) => {
  try {
    const userData = await pool.query(
      `SELECT id, name, email, role, skills, company, about
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (userData.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(userData.rows[0]);

  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};