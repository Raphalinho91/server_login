const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { connectToDatabase } = require('./config/db');
const userRoutes = require('./routes/index');

require('dotenv').config();

fastify.register(cors, { origin: '*' });

const start = async () => {
  try {
    const database = await connectToDatabase();
    fastify.decorate('db', database);
    fastify.register(userRoutes, { prefix: '/api' });

    const port = process.env.PORT || 8000;
    await fastify.listen({ port });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (error) {
    fastify.log.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

start();
