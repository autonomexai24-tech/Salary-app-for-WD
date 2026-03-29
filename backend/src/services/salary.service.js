const prisma = require("../utils/prisma");

/**
 * Service to handle Salary data calculations and persistence.
 */

async function createSalary(data) {
  // 1. We no longer block duplicates. We will gracefully upsert (overwrite) them at the end.

  // 2. Perform rigorous internal algorithmic calculations
  const toNumber = (v) => Number(v) || 0;

  const basicSalary = toNumber(data.basicSalary);
  const incentive = toNumber(data.incentive);
  const bonus = toNumber(data.bonus);
  const taDa = toNumber(data.taDa);
  const arrears = toNumber(data.arrears);

  const leavesTaken = toNumber(data.leavesTaken);
  const workingDays = toNumber(data.workingDays);
  const workingHours = toNumber(data.workingHours || 8);
  const otHours = toNumber(data.otHours);

  const advanceTaken = toNumber(data.advanceTaken);
  const advanceDeducted = toNumber(data.advanceDeducted);
  const additionalAdvance = toNumber(data.additionalAdvance);
  const extraFine = toNumber(data.extraFine);
  const professionalTax = toNumber(data.professionalTax);
  const emi = toNumber(data.emi);
  const minusMinutes = toNumber(data.minusMinutes);

  // 1. Salary per day
  const salaryPerDay = workingDays ? basicSalary / workingDays : 0;

  // 2. Salary per hour
  const salaryPerHour = workingHours ? salaryPerDay / workingHours : 0;

  // 3. OT Pay
  const otPay = salaryPerHour * otHours;

  // 4. Gross Salary
  const grossSalary = basicSalary + incentive + bonus + taDa + arrears + otPay;

  // 5. Leave Penalty
  const leavePenalty = leavesTaken * salaryPerDay;

  // 6. Time Penalty
  const timePenalty = (minusMinutes / 60) * salaryPerHour;

  // 7. Total Deduction
  const totalDeduction = professionalTax + advanceDeducted + extraFine + leavePenalty + timePenalty + emi;

  // 8. Net Salary
  const netSalary = grossSalary - totalDeduction;

  // 3. Save or Update all evaluated parameters permanently as a snapshot
  const salaryData = {
    ...data,
    otPay,
    leavePenalty,
    timePenalty,
    grossSalary,
    totalDeduction,
    netSalary,
  };

  const salary = await prisma.salary.upsert({
    where: {
      employeeId_month_year: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
      },
    },
    update: salaryData,
    create: salaryData,
  });

  // 4. Architect rule: Immediately map unalterable payslip identically upon Salary formulation.
  const payslipService = require("./payslip.service");
  await payslipService.createPayslip(salary.id);

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
