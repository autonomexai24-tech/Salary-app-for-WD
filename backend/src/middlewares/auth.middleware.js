const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "salary-app-wd-secret-key-2026";

/**
 * Middleware: Verify JWT from Authorization header.
 * Sets req.user = { id, role } on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/**
 * Middleware factory: Check if user role is in the allowed list.
 * Must be used AFTER requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied — insufficient permissions",
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
