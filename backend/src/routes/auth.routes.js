const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// Public
router.post("/login", authController.login);

// Protected
router.get("/me", requireAuth, authController.me);

module.exports = router;
