import { TimeSlot } from "./times";

export interface BookingState {
    service?: { id: number; name: string; duration: string; price: string };
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