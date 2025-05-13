export const BOOKING_CONSTANTS = {
    DAYS_IN_ADVANCE: 90, // How many days in advance can appointments be booked
    TIME_SLOT_INTERVAL: 30, // Minutes between each time slot
    DEFAULT_PROCEDURE_LENGTH: 60, // Default procedure length in minutes if not specified
    DEFAULT_START_HOUR: 9, // Default start hour (9 AM)
    DEFAULT_END_HOUR: 18 // Default end hour (6 PM)
} as const;

export type TimeSlot = {
    start: string;  // ISO string
    end: string;    // ISO string
}; 