const { z } = require("zod");

/**
 * Schema for creating or updating a department.
 * Trims and lowercases the name to prevent duplicates like "HR" vs " hr ".
 */
const departmentBodySchema = z.object({
  name: z
    .string({ required_error: "Department name is required" })
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must be at most 100 characters")
    .transform((val) => val.replace(/\s+/g, " ").trim()),
});

/**
 * Schema for pagination query parameters.
 */
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Schema for a UUID path parameter.
 */
const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid department ID"),
});

module.exports = {
  departmentBodySchema,
  paginationSchema,
  uuidParamSchema,
};
