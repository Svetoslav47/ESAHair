import { TimeSlot } from "./times";

export interface BarberAvailability {
    [date: string]: TimeSlot[];
}