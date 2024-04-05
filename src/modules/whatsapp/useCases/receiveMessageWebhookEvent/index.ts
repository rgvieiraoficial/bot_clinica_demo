import { ContactsRepository } from '../../repositories/implementations/ContactsRepository';

import { TicketsRepository } from '../../repositories/implementations/TicketsReposity';

import { ReceiveMessageWebhookEventUseCase } from './ReceiveMessageWebhookEventUseCase';

import { ReceiveMessageWebhookEventController } from './ReceiveMessageWebhookEventController';

const contactsRepository = ContactsRepository.getInstance();

const ticketsRepository = TicketsRepository.getInstance();

const receiveMessageWebhookEventUseCase = new ReceiveMessageWebhookEventUseCase(contactsRepository, ticketsRepository);

const receiveMessageWebhookEventController = new ReceiveMessageWebhookEventController(receiveMessageWebhookEventUseCase);

export { receiveMessageWebhookEventController };