import { Ticket } from '../../entities/Ticket';

import { ITicketsRepository } from '../ITicketsReposity';

class TicketsRepository implements ITicketsRepository {
  private tickets: Ticket[];

  private static INSTANCE: TicketsRepository;

  private constructor() {
    this.tickets = [];
  }

  public static getInstance(): TicketsRepository {
    if (!TicketsRepository.INSTANCE) {
      TicketsRepository.INSTANCE = new TicketsRepository();
    }

    return TicketsRepository.INSTANCE;
  }

  async create({ stage, status, contact_id }) {
    const ticket = new Ticket();

    Object.assign(ticket, {
      stage,
      status,
      contact_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.tickets.push(ticket);

    return ticket;
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = this.tickets.find((ticket) => ticket.id === id);

    return ticket;
  }

  async findByContactId(contact_id: string): Promise<Ticket | null> {
    const ticket = this.tickets.find((ticket) => ticket.contact_id === contact_id);

    return ticket;
  }

  async findOpenTicketByContact(contact_id: string): Promise<Ticket | null> {
    const ticket = this.tickets.find((ticket) => ticket.contact_id === contact_id && ticket.status === 1);

    return ticket;
  }

  async update(id: string, stage: string, status: number): Promise<void> {
    const ticket = this.tickets.find((ticket) => ticket.id === id);

    Object.assign(ticket, {
      ...ticket,
      stage,
      status
    });

    console.log(this.tickets);
  }

  async list(): Promise<Ticket[] | null> {
    const tickets = this.tickets;

    return tickets;
  }
}

export { TicketsRepository };