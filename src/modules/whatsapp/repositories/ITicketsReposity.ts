import { Ticket } from '../entities/Ticket';

interface ITicketsRepository {
  create({ stage, status, contact_id }): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findByContactId(whatsapp_number: string): Promise<Ticket | null>;
  findOpenTicketByContact(contact_id: string): Promise<Ticket | null>;
  update(id: string, stage: string, status: number): Promise<void>;
  list(): Promise<Ticket[] | null>;
}

export { ITicketsRepository };