const { z } = require("zod");
const { paginationSchema, uuidParamSchema } = require("./department.validation");

const createSalarySchema = z.object({
  employeeId: z.string({ required_error: "Employee ID is required" }).uuid("Invalid employee UUID format"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  
  workingDays: z.number().int().min(0),
  workingHours: z.number().int().min(0),
  
  basicSalary: z.number().min(0),
  
  incentive: z.number().min(0).optional().nullable(),
  bonus: z.number().min(0).optional().nullable(),
  taDa: z.number().min(0).optional().nullable(),
  arrears: z.number().min(0).optional().nullable(),
  
  otHours: z.number().min(0).optional().nullable(),
  
  leavesTaken: z.number().int().min(0).optional().nullable(),
  
  minusMinutes: z.number().int().min(0).optional().nullable(),
  
  extraFine: z.number().min(0).optional().nullable(),
  
  professionalTax: z.number().min(0).optional().nullable(),
  emi: z.number().min(0).optional().nullable(),
  
  advanceTaken: z.number().min(0).optional().nullable(),
  advanceDeducted: z.number().min(0).optional().nullable(),
  
  // These frontend-only fields pass through validation but are NOT stored in Salary model
  additionalAdvance: z.number().min(0).optional().nullable(),
  advanceRemaining: z.number().min(0).optional().nullable(),
});

module.exports = {
  createSalarySchema,
  paginationSchema,
  uuidParamSchema,
};
