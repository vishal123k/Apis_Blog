const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const commentCtrl = require("../controllers/commentController");


router.post("/", auth, commentCtrl.addComment);
router.get("/", commentCtrl.getComments);
router.put("/:id", auth, commentCtrl.updateComment);
router.delete("/:id", auth, commentCtrl.deleteComment);
router.post("/:id/like", auth, commentCtrl.toggleLike);
router.put("/:id/approve", auth, commentCtrl.approveComment);

module.exports = router;
