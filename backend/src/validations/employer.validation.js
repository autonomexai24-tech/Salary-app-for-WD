const { z } = require("zod");

const createEmployerSchema = z.object({
  name: z
    .string({ required_error: "Employer name is required" })
    .trim()
    .min(1, "Employer name cannot be empty")
    .max(200, "Employer name must be at most 200 characters"),
  address: z.string().max(1000).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});

module.exports = {
  createEmployerSchema,
};
