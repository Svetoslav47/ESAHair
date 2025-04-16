import { BOOKING_CONSTANTS, TimeSlot } from '../constants/booking';
import { addMinutes, setHours, setMinutes, eachDayOfInterval, addDays, isSameDay, startOfDay, format, isAfter, isWithinInterval } from 'date-fns';
import { DayOff } from '../models/DayOff';
import { Types } from 'mongoose';
import { CalendarService, BookedSlot } from './calendarService';

export class TimeSlotService {
    static async generateTimeSlotsForDay(
        date: Date,
        startHour: number,
        endHour: number,
        procedureLength: number = BOOKING_CONSTANTS.DEFAULT_PROCEDURE_LENGTH,
        bookedSlots: BookedSlot[],
    ): Promise<TimeSlot[]> {
        const slots: TimeSlot[] = [];
        let dayStart = setHours(setMinutes(date, 0), startHour);
        const dayEnd = setHours(setMinutes(date, 0), endHour);

        const currentTime = new Date();
        if (isAfter(currentTime, dayStart)) {
            // Find the next available slot after current time
            let nextSlot = new Date(dayStart);
            while (isAfter(currentTime, nextSlot)) {
                nextSlot = addMinutes(nextSlot, BOOKING_CONSTANTS.TIME_SLOT_INTERVAL);
            }
            dayStart = nextSlot;
        }

        let currentSlotStart = dayStart;

        while (addMinutes(currentSlotStart, procedureLength) <= dayEnd) {
            let isSlotBooked = false;
            if (bookedSlots) {
                    isSlotBooked = bookedSlots.some(slot => {
                    const slotStart = new Date(slot.start);
                    const slotEnd = new Date(slot.end);
                    return isWithinInterval(currentSlotStart, { start: slotStart, end: slotEnd });
                });
            }

            if (!isSlotBooked) {
                slots.push({
                    start: currentSlotStart.toISOString(),
                    end: addMinutes(currentSlotStart, procedureLength).toISOString()
                });
            }

            currentSlotStart = addMinutes(currentSlotStart, BOOKING_CONSTANTS.TIME_SLOT_INTERVAL);
        }

        return slots;
    }

    static async generateAvailableTimeSlots(
        startDate: Date,
        workingDays: string[],
        startHour: number,
        endHour: number,
        barberId: Types.ObjectId,
        procedureLength: number = BOOKING_CONSTANTS.DEFAULT_PROCEDURE_LENGTH,
        calendarService: CalendarService
    ): Promise<Record<string, TimeSlot[]>> {
        // Create a new date object to avoid modifying the input
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);
        const endDate = new Date(normalizedStartDate);
        endDate.setDate(endDate.getDate() + BOOKING_CONSTANTS.DAYS_IN_ADVANCE);
        const dates = eachDayOfInterval({ start: normalizedStartDate, end: endDate });

        // Get all days off for this barber within the date range
        const daysOff = await DayOff.find({
            barber: barberId,
            date: {
                $gte: normalizedStartDate,
                $lte: endDate
            }
        });

        // Create a Set of day off dates for efficient lookup
        const daysOffSet = new Set(
            daysOff.map(dayOff => format(dayOff.date, 'yyyy-MM-dd'))
        );
        
        const bookedSlots = await calendarService.getBarberAppointments(barberId, startDate, endDate);
        console.log(bookedSlots);
        // Filter working days and reduce to a dictionary
        return dates
            .filter(date => {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = format(date, 'yyyy-MM-dd');
                return workingDays.includes(dayName) && !daysOffSet.has(dateStr);
            })
            .reduce(async (accPromise, date) => {
                const acc = await accPromise;
                const dateKey = format(date, 'yyyy-MM-dd');
                acc[dateKey] = await this.generateTimeSlotsForDay(date, startHour, endHour, procedureLength, bookedSlots[dateKey]);
                return acc;
            }, Promise.resolve({} as Record<string, TimeSlot[]>));
    }
} 