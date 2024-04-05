import { FastifyReply, FastifyRequest } from 'fastify';

import { ReceiveMessageWebhookEventUseCase } from './ReceiveMessageWebhookEventUseCase';

interface IRequestBody {
  entry: [
    {
      changes: [
        {
          response: object,
          value: {
            metadata: {
              phone_number_id: string;
            },
            contacts: [
              {
                profile: {
                  name: string;
                }
              }
            ],
            messages: [
              {
                id: string;
                from: string;
                type: string;
                text: {
                  body: string;
                },
                interactive: {
                  type: string,
                  list_reply: {
                    id: string,
                    title: string
                  }
                }
              }
            ]
          }
        }
      ]
    }
  ];
}

class ReceiveMessageWebhookEventController {

  constructor(private receiveMessageWebhookEvent: ReceiveMessageWebhookEventUseCase) { }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const requestBody = request.body as IRequestBody;

    if (requestBody.entry[0].changes[0].value.contacts) {
      const message_type = requestBody.entry[0].changes[0].value.messages[0].type;

      console.log(message_type);

      if (message_type === 'interactive') {

        const name = requestBody.entry[0].changes[0].value.contacts[0].profile.name;

        const phone_number_id = requestBody.entry[0].changes[0].value.metadata.phone_number_id;

        const from = requestBody.entry[0].changes[0].value.messages[0].from; //extract the phone number from the webhook payload

        const message = requestBody.entry[0].changes[0].value.messages[0].interactive.list_reply.id;

        await this.receiveMessageWebhookEvent.execute({ name, phone_number_id, from, message_type, message });
      } else if (message_type === 'text') {
        const name = requestBody.entry[0].changes[0].value.contacts[0].profile.name;

        const phone_number_id = requestBody.entry[0].changes[0].value.metadata.phone_number_id;

        const from = requestBody.entry[0].changes[0].value.messages[0].from; //extract the phone number from the webhook payload

        const message = requestBody.entry[0].changes[0].value.messages[0].text.body; //extract the message text from the webhook payload

        await this.receiveMessageWebhookEvent.execute({ name, phone_number_id, from, message_type, message });
      }
    }

    return reply.status(200).send();
  }
}

export { ReceiveMessageWebhookEventController };