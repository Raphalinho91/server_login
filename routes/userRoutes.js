const {
  addressePost,
  infoPersoPost,
  infoBancairePost,
  getUserAdmin,
  getAllUser,
} = require("../controllers/profile/account");
const {
  signUp,
  signIn,
  sendVerificationEmail,
  verifyEmailCode,
  forgotPassword,
  verifyResetCode,
  updatePassword,
  sendEmail,
  getUserInfo,
} = require("../controllers/user/authentification");

async function userRoutes(fastify, options) {
  return new Promise((resolve, reject) => {
    try {
      fastify.post("/signup", signUp);
      fastify.post("/signin", signIn);
      fastify.post("/send-verification-email", sendVerificationEmail);
      fastify.post("/send-email", sendEmail);
      fastify.post("/verify-email-code", verifyEmailCode);
      fastify.post("/send-verification-email-password", forgotPassword);
      fastify.post("/verify-password-code", verifyResetCode);
      fastify.post("/update-password", updatePassword);
      fastify.post("/adresse", addressePost);
      fastify.post("/info-perso", infoPersoPost);
      fastify.post("/info-bancaire", infoBancairePost);
      fastify.get(
        "/user-info",
        { preHandler: getUserInfo },
        async (request, reply) => {
          const {
            email,
            firstName,
            lastName,
            pays,
            province,
            ville,
            codePostale,
            adresse,
            sexe,
            taille,
            poids,
            vetementTaille,
            pointure,
            numeroBancaire,
            dateCarte,
            cvcCarte,
            admin,
          } = request.user;
          return reply.send({
            email,
            firstName,
            lastName,
            pays,
            province,
            ville,
            codePostale,
            adresse,
            sexe,
            taille,
            poids,
            vetementTaille,
            pointure,
            numeroBancaire,
            dateCarte,
            cvcCarte,
            admin,
          });
        }
      );
      fastify.get("/admin-user", getUserAdmin);
      fastify.get("/allUsers", { preHandler: getUserAdmin }, getAllUser);
      resolve();
    } catch (error) {
      console.error("Error in userRoutes plugin:", error);
      reject(error);
    }
  });
}

module.exports = userRoutes;
