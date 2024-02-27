const {
  sendVerificationEmail,
  sendEmail,
  verifyEmailCode,
} = require("../../controllers/user/sendEmail");

async function sendEmailRoute(fastify, options) {
  fastify.post("/send-verification-email", sendVerificationEmail);
  fastify.post("/send-email", sendEmail);
  fastify.post("/verify-email-code", verifyEmailCode);
}

module.exports = { sendEmailRoute };
