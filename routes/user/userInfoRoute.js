const { getUserInfo } = require("../../controllers/user/userInfo");

async function userInfoRoute(fastify, options) {
  return new Promise((resolve, reject) => {
    try {
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
      resolve();
    } catch (error) {
      console.error("Error in userRoutes plugin:", error);
      reject(error);
    }
  });
}

module.exports = { userInfoRoute };
