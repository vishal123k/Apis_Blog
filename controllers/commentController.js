const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res) => {
  try {
    const { content, postId, parentComment } = req.body;

    if (!content || !postId) {
      return res.status(400).json({
        message: "Content and postId are required",
      });
    }

    //Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //If reply check parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user.id,
      parentComment: parentComment || null,
    });

    res.status(201).json({
      message: parentComment
        ? "Reply added successfully"
        : "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId, page = 1, limit = 10 } = req.query;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const filter = {
      post: postId,
      isApproved: true,
    };

    const comments = await Comment.find(filter)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalComments = await Comment.countDocuments(filter);

    res.json({
      totalComments,
      currentPage: Number(page),
      totalPages: Math.ceil(totalComments / limit),
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Owner or admin
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: "Comment and replies deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      totalLikes: comment.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.isApproved = true;
    await comment.save();

    res.json({ message: "Comment approved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
