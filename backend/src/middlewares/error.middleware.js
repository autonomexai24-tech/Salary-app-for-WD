const { ZodError } = require("zod");
const { Prisma } = require("@prisma/client");

/**
 * Centralized error-handling middleware.
 * Catches Zod validation errors, Prisma known errors, and generic errors.
 */
function errorMiddleware(err, _req, res, _next) {
  // --- Zod validation errors ---
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }

  // --- Prisma known request errors ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation
    if (err.code === "P2002") {
      const target = err.meta?.target;
      return res.status(409).json({
        success: false,
        message: `A record with that ${target || "value"} already exists`,
      });
    }

    // P2025 = record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }
  }

  // --- Application-level errors with a status code ---
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // --- Catch-all ---
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorMiddleware;
