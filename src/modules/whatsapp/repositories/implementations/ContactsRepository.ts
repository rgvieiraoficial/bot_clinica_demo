import { Contact } from '../../entities/Contact';

import { IContactsRepository } from '../IContactsRepository';

class ContactsRepository implements IContactsRepository {
  private contacts: Contact[];

  private static INSTANCE: ContactsRepository;

  private constructor() {
    this.contacts = [];
  }

  public static getInstance(): ContactsRepository {
    if (!ContactsRepository.INSTANCE) {
      ContactsRepository.INSTANCE = new ContactsRepository();
    }

    return ContactsRepository.INSTANCE;
  }

  async create({ name, whatsapp_number, phone_number_id }) {
    const contact = new Contact();

    Object.assign(contact, {
      name,
      whatsapp_number,
      phone_number_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.contacts.push(contact);

    return contact;
  }

  async findById(id: string): Promise<Contact | null> {
    const contact = this.contacts.find((contact) => contact.id === id);

    return contact;
  }

  async findByWhatsAppNumber(whatsapp_number: string): Promise<Contact | null> {
    const contact = this.contacts.find((contact) => contact.whatsapp_number === whatsapp_number);

    return contact;
  }

  async list(): Promise<Contact[] | null> {
    const contacts = this.contacts;

    return contacts;
  }
}

export { ContactsRepository };