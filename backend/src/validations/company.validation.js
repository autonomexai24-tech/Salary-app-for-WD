const { z } = require("zod");

const companyUpsertSchema = z.object({
  name: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(1, "Company name cannot be empty")
    .max(200, "Company name must be at most 200 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  logoUrl: z.string().max(2000).optional().or(z.literal("")),
});

module.exports = {
  companyUpsertSchema,
};
