import { FastifyInstance } from 'fastify';

import { whatsappRoutes } from './whatsapp.routes';

async function appRoutes(fastify: FastifyInstance) {
  fastify.register(whatsappRoutes, { prefix: '/whatsapp' });
};

export { appRoutes };