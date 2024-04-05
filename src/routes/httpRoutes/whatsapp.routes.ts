import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { receiveMessageWebhookEventController } from '../../modules/whatsapp/useCases/receiveMessageWebhookEvent';
import { verifyWebhookController } from '../../modules/whatsapp/useCases/verifyWebhook';

interface IEvent {
  entry: [
    {
      changes: [
        {
          field: string
        }
      ]
    }
  ]
}

async function whatsappRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/webhook', (request, reply) => {
    verifyWebhookController.handle(request, reply);
  });

  fastify.post('/webhook', (request, reply) => {
    const event = request.body as IEvent;

    if (event.entry[0].changes[0].field == 'messages') {
      receiveMessageWebhookEventController.handle(request, reply);
    }
  });
}

export { whatsappRoutes };