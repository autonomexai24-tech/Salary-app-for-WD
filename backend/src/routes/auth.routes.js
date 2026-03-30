const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

// Public
router.post("/login", authController.login);

// Protected
router.get("/me", requireAuth, authController.me);

// Admin-only
router.get("/users", requireAuth, requireRole("ADMIN"), authController.getUsers);
router.put("/change-password", requireAuth, requireRole("ADMIN"), authController.changePassword);

module.exports = router;
