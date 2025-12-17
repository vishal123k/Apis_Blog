const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      minlength: 10
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    isPublished: {
      type: Boolean,
      default: true
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", postSchema);
