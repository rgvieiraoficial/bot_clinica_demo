import { v4 as uuidV4 } from "uuid";

class Ticket {
  id?: string;
  stage: string;
  status: number;
  contact_id: string;
  created_at: Date;
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Ticket };
