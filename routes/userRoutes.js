const {
    signUp,
    signIn,
    sendVerificationEmail,
    verifyEmailCode,
    forgotPassword,
    verifyResetCode,
    updatePassword
  } = require("../controllers/user/authentification");
  
  async function userRoutes(fastify, options) {
    return new Promise((resolve, reject) => {
      try {
        fastify.post("/signup", signUp);
        fastify.post("/signin", signIn);
        fastify.post("/send-verification-email", sendVerificationEmail);
        fastify.post("/verify-email-code", verifyEmailCode);
        fastify.post("/send-verification-email-password", forgotPassword);
        fastify.post("/verify-password-code", verifyResetCode);
        fastify.post('/update-password', updatePassword);
        resolve();
      } catch (error) {
        console.error("Error in userRoutes plugin:", error);
        reject(error);
      }
    });
  }
  
  module.exports = userRoutes;
  