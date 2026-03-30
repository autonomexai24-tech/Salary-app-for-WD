const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "salary-app-wd-secret-key-2026";
const JWT_EXPIRES_IN = "7d";

/**
 * Authenticate user by userId + password.
 * Returns { token, user } on success.
 */
async function authenticateUser(userId, password) {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) {
    throw Object.assign(new Error("Invalid User ID or password"), { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error("Invalid User ID or password"), { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Get user by primary key (UUID).
 */
async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    role: user.role,
  };
}

/**
 * Change password for a user (admin-only, no OTP).
 * @param {string} userId - The user's login ID (e.g. "EMP-2024")
 * @param {string} newPassword - The new plaintext password
 */
async function changePassword(userId, newPassword) {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { userId },
    data: { password: hashedPassword },
  });

  return { userId: user.userId, name: user.name, role: user.role };
}

/**
 * Get all users (admin-only, for listing in the change-password UI).
 */
async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, userId: true, name: true, role: true },
    orderBy: { role: "asc" },
  });
  return users;
}

module.exports = { authenticateUser, getUserById, changePassword, getAllUsers };
