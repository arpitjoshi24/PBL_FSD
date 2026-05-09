import pool from "../config/db.js";

// @desc    Create a new social post with Multiple Media Files
// @route   POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    const mediaFiles = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith("video") ? "video" : "image",
      name: file.originalname
    })) : [];

    if (!content && mediaFiles.length === 0) {
      return res.status(400).json({ 
        message: "Post must have at least text content or a media file." 
      });
    }

    const newPost = await pool.query(
      `INSERT INTO posts (user_id, content, media_files)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, content, JSON.stringify(mediaFiles)]
    );

    // Return the post with author details, 0 likes, and not liked by me (since it's new)
    const postWithUser = await pool.query(
      `SELECT p.*, u.name as author_name, u.role as author_role,
       0 as like_count, false as liked_by_me
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
    // If user is logged in, we check their likes. If not, it defaults to null.
    const userId = req.user?.id || null; 

    const posts = await pool.query(
      `SELECT p.*, u.name as author_name, u.role as author_role,
       (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
       EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`,
      [userId]
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

// ==========================================
// NEW: LIKE & COMMENT LOGIC
// ==========================================

// @desc    Toggle Like (Enforces ONE like per user per post)
// @route   POST /api/posts/:id/like
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user.id;

    // 1. Check if the user already liked this post
    const existing = await pool.query(
      "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, id]
    );

    if (existing.rows.length > 0) {
      // 2a. If it exists, UNLIKE it (Delete the record)
      await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [userId, id]);
      return res.status(200).json({ liked: false });
    } else {
      // 2b. If it doesn't exist, LIKE it (Insert the record)
      await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userId, id]);
      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add Comment (Allows UNLIMITED comments per user per post)
// @route   POST /api/posts/:id/comments
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

    // Insert the new comment
    const newComment = await pool.query(
      `INSERT INTO comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [id, req.user.id, content]
    );

    // Fetch the author's name to return instantly to the frontend
    const commentWithUser = await pool.query(
      `SELECT c.*, u.name as author_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [newComment.rows[0].id]
    );

    res.status(201).json(commentWithUser.rows[0]);
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all comments for a specific post
// @route   GET /api/posts/:id/comments
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await pool.query(
      `SELECT c.*, u.name as author_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.status(200).json(comments.rows);
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};