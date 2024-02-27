const {signUpRoute} = require('./user/signUpRoute');
const { signInRoute } = require('./user/loginRoute')
const { passwordRoute } = require('./user/passwordRoute')
const { sendEmailRoute } = require('./user/sendEmailRoute')
const { accountRoute } = require('./account/accountRoute');
const { userInfoRoute } = require('./user/userInfoRoute');

async function userRoutes(fastify, options) {
  await signUpRoute(fastify, options);
  await signInRoute(fastify, options);
  await sendEmailRoute(fastify, options);
  await passwordRoute(fastify, options);
  await userInfoRoute(fastify, options);
  await accountRoute(fastify, options);
};

module.exports = userRoutes;
