const { z } = require("zod");
const { paginationSchema, uuidParamSchema } = require("./department.validation");

/**
 * Schema for creating or updating an employee.
 */
const createEmployeeSchema = z.object({
  firstName: z.string({ required_error: "First name is required" }).trim().min(1, "First name cannot be empty"),
  lastName: z.string({ required_error: "Last name is required" }).trim().min(1, "Last name cannot be empty"),
  phone: z.string({ required_error: "Phone is required" }).trim().min(5, "Phone is required"),
  address: z.string().trim().optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  qualification: z.string().trim().optional().nullable(),
  salary: z.number({ required_error: "Salary is required" }).min(0, "Salary cannot be negative"),
  previousSalary: z.number().optional().nullable(),
  permittedLeaves: z.number().int().optional().nullable(),
  
  departmentId: z.string().uuid("Invalid department UUID format").optional().nullable(),
  department: z.string().trim().optional().nullable(),
}).refine(data => data.departmentId || data.department, {
  message: "Either departmentId or department (name) must be provided",
  path: ["departmentId"],
});

module.exports = {
  createEmployeeSchema,
  paginationSchema,
  uuidParamSchema,
};
