const { z } = require("zod");

const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(2).max(50),
  })
  .strict();

module.exports = {
  registerSchema,
};
