const { z } = require("zod");

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6).max(20),
  })
  .strict();

module.exports = {
  loginSchema,
};
