const prisma = require("../utils/prisma");

/**
 * Create a new department.
 * @param {{ name: string }} data
 */
async function createDepartment(data) {
  // Case-insensitive duplicate check (normalized name)
  const existing = await prisma.department.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      is_deleted: false,
    },
  });

  if (existing) {
    const error = new Error("A department with this name already exists");
    error.statusCode = 409;
    throw error;
  }

  // If a soft-deleted department with the same name exists, restore it
  const softDeleted = await prisma.department.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      is_deleted: true,
    },
  });

  if (softDeleted) {
    const restored = await prisma.department.update({
      where: { id: softDeleted.id },
      data: { is_deleted: false, name: data.name },
    });
    return restored;
  }

  const department = await prisma.department.create({
    data: { name: data.name },
  });

  return department;
}

/**
 * Get paginated list of active (non-deleted) departments.
 * @param {{ page: number, limit: number }} params
 */
async function getDepartments({ page, limit }) {
  const skip = (page - 1) * limit;

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where: { is_deleted: false },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.department.count({ where: { is_deleted: false } }),
  ]);

  return {
    data: departments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update an existing department by ID.
 * @param {string} id
 * @param {{ name: string }} data
 */
async function updateDepartment(id, data) {
  // Ensure the department exists and is not deleted
  const department = await prisma.department.findUnique({ where: { id } });

  if (!department || department.is_deleted) {
    const error = new Error("Department not found");
    error.statusCode = 404;
    throw error;
  }

  // Case-insensitive duplicate check (exclude self)
  const duplicate = await prisma.department.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      is_deleted: false,
      id: { not: id },
    },
  });

  if (duplicate) {
    const error = new Error("A department with this name already exists");
    error.statusCode = 409;
    throw error;
  }

  const updated = await prisma.department.update({
    where: { id },
    data: { name: data.name },
  });

  return updated;
}

/**
 * Soft-delete a department by setting is_deleted = true.
 * @param {string} id
 */
async function softDeleteDepartment(id) {
  const department = await prisma.department.findUnique({ where: { id } });

  if (!department || department.is_deleted) {
    const error = new Error("Department not found");
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.department.update({
    where: { id },
    data: { is_deleted: true },
  });

  return deleted;
}

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  softDeleteDepartment,
};
