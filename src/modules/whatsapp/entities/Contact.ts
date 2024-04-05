import { v4 as uuidV4 } from "uuid";

class Contact {
  id?: string;
  name: string;
  whatsapp_number: string;
  phone_number_id: string;
  created_at: Date;
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Contact };
