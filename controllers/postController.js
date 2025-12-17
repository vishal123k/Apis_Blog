const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      isPublished: isPublished ?? true,
      author: req.user.id,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, tag } = req.query;

    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await Post.find(query)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalPosts = await Post.countDocuments(query);

    res.json({
      totalPosts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "username email");

    if (!post || !post.isPublished) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "Invalid post ID" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, tags, isPublished } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (isPublished !== undefined) post.isPublished = isPublished;

    await post.save();

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: "Post and related comments deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      totalLikes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
