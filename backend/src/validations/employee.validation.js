const { z } = require("zod");
const { paginationSchema, uuidParamSchema } = require("./department.validation");

/**
 * Pre-process date strings: empty strings and invalid dates become null.
 */
const safeDate = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return null;
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
  },
  z.date().nullable().optional()
);

/**
 * Schema for creating or updating an employee.
 */
const createEmployeeSchema = z.object({
  firstName: z.string({ required_error: "First name is required" }).trim().min(1, "First name cannot be empty"),
  lastName: z.string({ required_error: "Last name is required" }).trim().min(1, "Last name cannot be empty"),
  phone: z.string({ required_error: "Phone is required" }).trim().min(1, "Phone is required"),
  address: z.string().trim().optional().nullable(),
  dateOfBirth: safeDate,
  gender: z.string().trim().optional().nullable(),
  qualification: z.string().trim().optional().nullable(),
  salary: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Salary cannot be negative")
  ),
  previousSalary: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().nullable().optional()
  ),
  permittedLeaves: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().nullable().optional()
  ),
  
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
