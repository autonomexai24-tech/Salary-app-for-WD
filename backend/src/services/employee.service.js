const prisma = require("../utils/prisma");

/**
 * Service to handle Employee data operations.
 */

async function createEmployee(data) {
  // Validate department exists and is not soft-deleted
  const department = await prisma.department.findUnique({
    where: { 
      id: data.departmentId, 
      is_deleted: false 
    },
  });

  if (!department) {
    const error = new Error("Invalid department");
    error.statusCode = 400;
    throw error;
  }

  // Create employee
  const employee = await prisma.employee.create({
    data,
  });

  return employee;
}

async function getEmployees({ page, limit }) {
  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: { is_deleted: false },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        department: true,
      },
    }),
    prisma.employee.count({ where: { is_deleted: false } }),
  ]);

  return {
    data: employees,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateEmployee(id, data) {
  // Verify employee exists and is not soft deleted
  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee || employee.is_deleted) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  // If departmentId is changing, verify the new department exists
  if (data.departmentId && data.departmentId !== employee.departmentId) {
    const newDepartment = await prisma.department.findUnique({
      where: {
        id: data.departmentId,
        is_deleted: false,
      },
    });

    if (!newDepartment) {
      const error = new Error("Invalid department");
      error.statusCode = 400;
      throw error;
    }
  }

  // Update fields
  const updated = await prisma.employee.update({
    where: { id },
    data,
  });

  return updated;
}

async function deleteEmployee(id) {
  // Hard delete as mandated by user spec
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.employee.delete({
    where: { id },
  });

  return deleted;
}

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
};
