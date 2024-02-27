const {
  forgotPassword,
  verifyResetCode,
  updatePassword,
} = require("../../controllers/user/password");

async function passwordRoute(fastify, options) {
  fastify.post("/send-verification-email-password", forgotPassword);
  fastify.post("/verify-password-code", verifyResetCode);
  fastify.post("/update-password", updatePassword);
}

module.exports = { passwordRoute };
