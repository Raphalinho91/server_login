const {
  addressePost,
  infoPersoPost,
  infoBancairePost,
  getUserAdmin,
  getAllUser,
  deleteOneUser,
} = require("../../controllers/profile/account");
const { getUserInfo } = require("../../controllers/user/userInfo");

async function accountRoute(fastify, options) {
  return new Promise((resolve, reject) => {
    try {
      fastify.post("/adresse", { preHandler: getUserInfo }, addressePost);
      fastify.post("/info-perso", { preHandler: getUserInfo }, infoPersoPost);
      fastify.post("/info-bancaire", { preHandler: getUserInfo }, infoBancairePost);
      fastify.get("/admin-user", { preHandler: getUserInfo }, getUserAdmin);
      fastify.get("/allUsers", { preHandler: [getUserInfo, getUserAdmin] }, getAllUser);
      fastify.delete("/delete/:userId", { preHandler: getUserInfo }, deleteOneUser);
      resolve();
    } catch (error) {
      console.error("Error in userRoutes plugin:", error);
      reject(error);
    }
  });
}

module.exports = { accountRoute };
