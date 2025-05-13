import { TimeSlot } from "../types/times";
import { Service } from "../types/service";
export interface BookingState {
    salon?: { id: string; name: string };
    service?: Service;
    staff?: { id: string; name: string };
    dateTime?: TimeSlot;
    duration?: number;
    details?: {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      termsAccepted: boolean;
    };
  }