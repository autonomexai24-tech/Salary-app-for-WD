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

module.exports = { login, me };
