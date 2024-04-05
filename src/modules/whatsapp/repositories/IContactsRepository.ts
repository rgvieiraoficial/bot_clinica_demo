import { Contact } from '../entities/Contact';

interface IContactsRepository {
  create({ name, whatsapp_number, phone_number_id }): Promise<Contact>;
  findById(id: string): Promise<Contact | null>;
  findByWhatsAppNumber(whatsapp_number: string): Promise<Contact | null>;
  list(): Promise<Contact[] | null>;
}

export { IContactsRepository };