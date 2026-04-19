import pool from "../config/db.js";

// @desc    Create a new social post (LinkedIn-style update)
// @route   POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { content, image_url } = req.body;

    // Content is mandatory for a social post
    if (!content) {
      return res.status(400).json({
        message: "Post content cannot be empty",
      });
    }

    const newPost = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, content, image_url || null]
    );

    // Fetch the author details immediately so the frontend can display it
    const postWithUser = await pool.query(
      `SELECT p.*, u.name as author_name, u.role as author_role
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [newPost.rows[0].id]
    );

    res.status(201).json(postWithUser.rows[0]);
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all social posts for the Explore Feed
// @route   GET /api/posts
export const getPosts = async (req, res) => {
  try {
    // We join with users to get the author's name and role for the feed cards
    const posts = await pool.query(
      `SELECT p.*, u.name as author_name, u.role as author_role
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.status(200).json(posts.rows);
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a post (Owner only)
// @route   DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized or post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};