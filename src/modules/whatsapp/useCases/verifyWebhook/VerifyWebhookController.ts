import { FastifyRequest, FastifyReply } from 'fastify';

import { VerifyWebhookUseCase } from './VerifyWebhookUseCase';

class VerifyWebhookController {

  constructor(private verifyWebhookUseCase: VerifyWebhookUseCase) { }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const mode = request.query["hub.mode"];
    const token = request.query["hub.verify_token"];
    const challenge = request.query["hub.challenge"];

    const verify = await this.verifyWebhookUseCase.execute({
      mode,
      token,
      challenge
    });

    if (verify) return reply.status(200).send(challenge);
    else return reply.status(403).send();
  }
}

export { VerifyWebhookController };