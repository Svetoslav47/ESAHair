import { TimeSlot } from "./times";
import { Service } from "./service";
export interface BookingState {
    service?: Service;
    staff?: { id: number; name: string };
    dateTime?: TimeSlot;
    details?: {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      termsAccepted: boolean;
    };
  }