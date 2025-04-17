import { TimeSlot } from "../types/times";
import { Service } from "../types/service";
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