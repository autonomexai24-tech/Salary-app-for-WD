const prisma = require("../utils/prisma");

/**
 * Service to handle Employee data operations.
 */

async function createEmployee(data) {
  // 1. If departmentId exists, validate normally
  if (data.departmentId) {
    const department = await prisma.department.findUnique({
      where: { 
        id: data.departmentId, 
      },
    });

    if (!department || department.is_deleted) {
      const error = new Error("Invalid department");
      error.statusCode = 400;
      throw error;
    }
  } 
  // 2. ELSE if department (name) exists, fetch it and map ID
  else if (data.department) {
    const dept = await prisma.department.findFirst({
      where: {
        name: { equals: data.department, mode: "insensitive" },
        is_deleted: false,
      },
    });

    if (!dept) {
      const error = new Error("Invalid department");
      error.statusCode = 400;
      throw error;
    }

    // Replace the name mapping with the newly located UUID
    data.departmentId = dept.id;
  }

  // 3. Clean department name field — Prisma only wants departmentId
  delete data.department;

  // 4. Employer linking: if previousCompany provided, find-or-create Employer
  let employerId = null;

  if (data.previousCompany) {
    const employerName = data.previousCompany.trim();

    // 4a. Ensure company exists (MANDATORY — employer requires companyId)
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: "Default Company" },
      });
    }

    // 4b. Find employer (case-insensitive to prevent duplicates)
    let employer = await prisma.employer.findFirst({
      where: {
        name: { equals: employerName, mode: "insensitive" },
      },
    });

    // 4c. Create employer if not found
    if (!employer) {
      employer = await prisma.employer.create({
        data: {
          name: employerName,
          companyId: company.id,
        },
      });
    }

    // 4d. Hard guarantee — no silent failure
    if (!employer || !employer.id) {
      const error = new Error("Employer creation failed");
      error.statusCode = 500;
      throw error;
    }

    employerId = employer.id;
  }

  // Clean previousCompany — not a Prisma column
  delete data.previousCompany;

  // Create employee with employer link
  const employee = await prisma.employee.create({
    data: {
      ...data,
      ...(employerId ? { employerId } : {}),
    },
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

  // Clean input to safely prevent Prisma relational field crashes
  delete data.department;

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
