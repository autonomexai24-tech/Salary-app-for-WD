const authService = require("../services/auth.service");

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      });
    }

    const result = await authService.authenticateUser(userId, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/change-password
 * Admin-only: change password for any user by their userId.
 */
async function changePassword(req, res, next) {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required",
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    const result = await authService.changePassword(userId, newPassword);

    res.json({
      success: true,
      data: result,
      message: "Password changed successfully",
    });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/auth/users
 * Admin-only: list all users (for password management UI).
 */
async function getUsers(req, res, next) {
  try {
    const users = await authService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, changePassword, getUsers };
