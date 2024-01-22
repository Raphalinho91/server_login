const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { connectToDatabase } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

fastify.register(cors, { origin: '*' });

const start = async () => {
  try {
    // Connecter à MongoDB avant de démarrer le serveur
    const database = await connectToDatabase();
    fastify.decorate('db', database);

    // Enregistrer les routes de l'utilisateur
    fastify.register(userRoutes, { prefix: '/api' });

    // Démarrer le serveur
    const port = process.env.PORT || 8000;
    await fastify.listen({ port });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (error) {
    fastify.log.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

start();
