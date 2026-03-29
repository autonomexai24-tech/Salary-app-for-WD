const prisma = require("../utils/prisma");

/**
 * Service to handle Salary data calculations and persistence.
 */

async function createSalary(data) {
  // 1. Check duplicate preventing overlapping records natively matching DB unique constraint
  const duplicate = await prisma.salary.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
      },
    },
  });

  if (duplicate) {
    const error = new Error("Salary entry already exists for this employee for this month/year");
    error.statusCode = 400;
    throw error;
  }

  // 2. Perform rigorous internal algorithmic calculations
  const salaryPerDay = data.basicSalary / data.workingDays;
  const salaryPerHour = data.basicSalary / data.workingHours;

  const otPay = (data.otHours || 0) * salaryPerHour;

  const grossSalary =
    data.basicSalary +
    (data.incentive || 0) +
    (data.bonus || 0) +
    (data.taDa || 0) +
    (data.arrears || 0) +
    otPay;

  const leavePenalty = (data.leavesTaken || 0) * salaryPerDay;

  const timePenalty = (data.minusMinutes || 0) + (data.extraFine || 0);

  const totalDeduction =
    leavePenalty +
    timePenalty +
    (data.advanceDeducted || 0) +
    (data.professionalTax || 0) +
    (data.emi || 0);

  const netSalary = grossSalary - totalDeduction;

  // 3. Save all evaluated parameters permanently as a snapshot
  const salary = await prisma.salary.create({
    data: {
      ...data,
      otPay,
      leavePenalty,
      timePenalty,
      grossSalary,
      totalDeduction,
      netSalary,
    },
  });

  return salary;
}

async function getSalaries({ page, limit }) {
  const skip = (page - 1) * limit;

  const [salaries, total] = await Promise.all([
    prisma.salary.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip,
      take: limit,
      include: {
        employee: true,
      },
    }),
    prisma.salary.count(),
  ]);

  return {
    data: salaries,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createSalary,
  getSalaries,
};
