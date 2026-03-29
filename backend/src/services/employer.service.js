const prisma = require("../utils/prisma");

/**
 * Create a new employer. Automatically links to the singleton company.
 */
async function createEmployer(data) {
  // Ensure company exists before creating employer
  const company = await prisma.company.findFirst();
  if (!company) {
    const error = new Error("Company must be created before adding employers");
    error.statusCode = 400;
    throw error;
  }

  const employer = await prisma.employer.create({
    data: {
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      companyId: company.id,
    },
  });

  return employer;
}

/**
 * Get all employers with optional pagination.
 */
async function getEmployers({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { name: true } },
        _count: { select: { employees: true } },
        employees: {
          include: {
            department: true,
          },
        },
      },
    }),
    prisma.employer.count(),
  ]);

  return {
    data: employers,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update an employer by ID.
 */
async function updateEmployer(id, data) {
  const employer = await prisma.employer.findUnique({ where: { id } });

  if (!employer) {
    const error = new Error("Employer not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.employer.update({
    where: { id },
    data: {
      name: data.name || employer.name,
      address: data.address !== undefined ? (data.address || null) : employer.address,
      phone: data.phone !== undefined ? (data.phone || null) : employer.phone,
    },
  });

  return updated;
}

/**
 * Delete an employer by ID.
 */
async function deleteEmployer(id) {
  const employer = await prisma.employer.findUnique({
    where: { id },
  });

  if (!employer) {
    const error = new Error("Employer not found");
    error.statusCode = 404;
    throw error;
  }

  // Safe delete: Unlink employees first, then delete employer
  await prisma.$transaction([
    prisma.employee.updateMany({
      where: { employerId: id },
      data: { employerId: null },
    }),
    prisma.employer.delete({
      where: { id },
    }),
  ]);

  return { message: "Employer deleted successfully" };
}

module.exports = {
  createEmployer,
  getEmployers,
  updateEmployer,
  deleteEmployer,
};
