const { signUp } = require("../../controllers/user/signup");
const { signUpSchema } = require("../../schema/signUpSchema");

async function signUpRoute(fastify, options) {
  fastify.post("/signup", { schema: signUpSchema }, signUp);
}

module.exports = { signUpRoute };
