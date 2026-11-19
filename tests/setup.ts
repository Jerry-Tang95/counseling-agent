process.env.ENCRYPTION_KEY = Buffer.from(
  "0123456789abcdef0123456789abcdef",
).toString("base64");
process.env.AUTH_SECRET = "test-only-auth-secret";
process.env.LLM_MOCK = "true";
