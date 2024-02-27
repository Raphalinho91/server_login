const { signIn } = require("../../controllers/user/login");
const { signInSchema } = require("../../schema/signInSchema");

async function signInRoute(fastify, options) {
  fastify.post("/signin", { schema: signInSchema }, signIn);
}

module.exports = { signInRoute };
