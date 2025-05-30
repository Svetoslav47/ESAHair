import { BOOKING_CONSTANTS, TimeSlot } from '../constants/booking';
import { addMinutes, setHours, setMinutes, eachDayOfInterval, addDays, isSameDay, startOfDay, format, isAfter, isWithinInterval, endOfDay, addHours } from 'date-fns';
import { DayOff } from '../models/DayOff';
import { Types } from 'mongoose';
import { CalendarService, BookedSlot } from './calendarService';
import { Barber } from '../models/Barber';
import { Saloon } from '../models/Saloon';
import Appointment, { IAppointment } from '../models/Appointment';
import { toZonedTime } from 'date-fns-tz';
import { start } from 'repl';
import { Service } from '../models/Service';

interface PopulatedSaloonAssignment {
    date: Date;
    saloon: {
        _id: Types.ObjectId;
        name: string;
        address: string;
        image?: string;
        gmapsLink?: string;
    };
}

interface PopulatedAppointment extends Omit<IAppointment, 'service'> {
    service: {
        _id: Types.ObjectId;
        name: string;
        duration: number;
    };
}

export class TimeSlotService {
    static isSlotBooked(slotStart: Date, bookedSlots: BookedSlot[], procedureLength: number): boolean {
        if (!bookedSlots) {
            return false;
        }

        
        const slotEnd = addMinutes(slotStart, procedureLength);
        return bookedSlots.some(bookedSlot => {
            let bookedSlotStart = new Date(bookedSlot.start);
            // bookedSlotStart = addHours(bookedSlotStart, 3);
            let bookedSlotEnd = new Date(bookedSlot.end);
            // bookedSlotEnd = addHours(bookedSlotEnd, 3);
            return slotStart < bookedSlotEnd && slotEnd > bookedSlotStart;
        });
    }

    static async generateTimeSlotsForDay(
        date: Date,
        startHour: number,
        endHour: number,
        procedureLength: number = BOOKING_CONSTANTS.DEFAULT_PROCEDURE_LENGTH,
        bookedSlots: BookedSlot[],
        startMinutes: number | null | undefined = 0,
        endMinutes: number | null | undefined = 0
    ): Promise<TimeSlot[]> {
        const zonedDate = date
        console.log(zonedDate)
        console.log('Generating time slots with params:', {
            date: zonedDate,
            startHour,
            endHour,
            procedureLength,
            bookedSlotsCount: bookedSlots?.length || 0,
            startMinutes: startMinutes ?? 0,
            endMinutes: endMinutes ?? 0
        });

        const slots: TimeSlot[] = [];
        
        let dayStart = isAfter(new Date(Date.UTC(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours() + 3,
            new Date().getMinutes(),
            0
        )), new Date(Date.UTC(
            zonedDate.getFullYear(),
            zonedDate.getMonth(),
            zonedDate.getDate(),
            startHour,
            startMinutes ?? 0,
            0
        ))) ? new Date(Date.UTC(
            zonedDate.getFullYear(),
            zonedDate.getMonth(),
            zonedDate.getDate(),
            new Date().getHours() + 3,
            new Date().getMinutes(),
            0
        )) : new Date(Date.UTC(
            zonedDate.getFullYear(),
            zonedDate.getMonth(),
            zonedDate.getDate(),
            startHour,
            startMinutes ?? 0,
            0
        ));
        let dayEnd = new Date(Date.UTC(
            zonedDate.getFullYear(),
            zonedDate.getMonth(),
            zonedDate.getDate(),
            endHour,
            endMinutes ?? 0,
            0
        ));

        console.log('Debug - Time calculations:', {
            startHour,
            endHour,
            dayStart: dayStart.toISOString(),
            dayEnd: dayEnd.toISOString(),
            procedureLength
        });

        const minutes = dayStart.getMinutes();
        const min_remainder = minutes % BOOKING_CONSTANTS.TIME_SLOT_INTERVAL;
        if(min_remainder > 0) {
            const minutes_to_next_slot = BOOKING_CONSTANTS.TIME_SLOT_INTERVAL - min_remainder;
            dayStart = addMinutes(dayStart, minutes_to_next_slot);
        }

        console.log('Day range:', {
            dayStart: dayStart.toISOString(),
            dayEnd: dayEnd.toISOString()
        });

        let currentSlotStart = dayStart;

        console.log("booked slots:", bookedSlots)
        while (currentSlotStart < dayEnd && addMinutes(currentSlotStart, procedureLength) <= dayEnd) {
            let isSlotBooked = false;
            if (bookedSlots) {
                isSlotBooked = this.isSlotBooked(currentSlotStart, bookedSlots, procedureLength);
            }

            if (!isSlotBooked) {
                const slotEnd = addMinutes(currentSlotStart, procedureLength);
                console.log('Debug - Slot:', {
                    start: currentSlotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    isWithinBounds: slotEnd <= dayEnd
                });
                slots.push({
                    start: currentSlotStart.toISOString(),
                    end: slotEnd.toISOString()
                });
            }

            currentSlotStart = addMinutes(currentSlotStart, BOOKING_CONSTANTS.TIME_SLOT_INTERVAL);
        }

        console.log('Generated slots:', slots.length);
        return slots;
    }

    static async generateAvailableTimeSlots(
        startDate: Date,
        workingDays: string[],
        startHour: number,
        endHour: number,
        barberId: Types.ObjectId,
        procedureLength: number = BOOKING_CONSTANTS.DEFAULT_PROCEDURE_LENGTH
    ): Promise<Record<string, TimeSlot[]>> {
        // Create a new date object to avoid modifying the input
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);
        const endDate = new Date(normalizedStartDate);
        endDate.setDate(endDate.getDate() + BOOKING_CONSTANTS.DAYS_IN_ADVANCE + 1);
        const dates = eachDayOfInterval({ start: normalizedStartDate, end: endDate });

        // Get all days off for this barber within the date range
        const daysOff = await DayOff.find({
            barber: barberId,
            date: {
                $gte: normalizedStartDate,
                $lte: endDate
            }
        });

        // Get barber details
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found');
        }

        // Create a Set of day off dates for efficient lookup
        const daysOffSet = new Set(
            daysOff.map(dayOff => format(dayOff.date, 'yyyy-MM-dd'))
        );
        
        // Query Appointment model for booked slots
        const appointments = (await Appointment.find({
            'staff.id': barberId,
            'dateTime.date': { $gte: format(normalizedStartDate, 'yyyy-MM-dd'), $lte: format(endDate, 'yyyy-MM-dd') },
            status: { $ne: 'cancelled' }
        }).populate('service')).map(doc => doc.toObject()) as unknown as PopulatedAppointment[];
        const bookedSlotsByDate: Record<string, BookedSlot[]> = {};
        appointments.forEach(app => {
            if (!bookedSlotsByDate[app.dateTime.date]) bookedSlotsByDate[app.dateTime.date] = [];
            // Assume app.dateTime.time is in HH:mm:ss format and service duration is known
            const start = new Date(`${app.dateTime.date}T${app.dateTime.time}`);
            const end = new Date(start.getTime() + (procedureLength * 60000));
            bookedSlotsByDate[app.dateTime.date].push({ start: start.toISOString(), end: end.toISOString() });
        });

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
                acc[dateKey] = await this.generateTimeSlotsForDay(
                    date, 
                    startHour, 
                    endHour, 
                    procedureLength, 
                    bookedSlotsByDate[dateKey] || [],
                    barber.startMinutes || 0,
                    barber.endMinutes || 0
                );
                return acc;
            }, Promise.resolve({} as Record<string, TimeSlot[]>));
    }

    static async getAvailableSlots(
        barberId: string,
        startDate: Date,
        endDate: Date,
        calendarService: CalendarService
    ) {
        const barber = await Barber.findById(barberId).populate<{ saloonAssignments: PopulatedSaloonAssignment[] }>('saloonAssignments.saloon');
        if (!barber) {
            throw new Error('Barber not found');
        }

        if (!barber.isActive) {
            return [];
        }

        const availableSlots: { date: string; time: string; saloon: string }[] = [];

        // Only allow booking for today and tomorrow
        const bookingStartDate = startOfDay(toZonedTime(startDate, "Europe/Sofia"));
        const bookingEndDate = endOfDay(toZonedTime(endDate, "Europe/Sofia"));

        // Get barber's assignments for the booking period
        const assignments = barber.saloonAssignments.filter(assignment => {
            const assignmentDate = new Date(assignment.date);
            return isWithinInterval(assignmentDate, {
                start: bookingStartDate,
                end: bookingEndDate
            });
        });

        // For each assignment, generate available time slots
        for (const assignment of assignments) {
            const assignmentDate = new Date(assignment.date);
            const startHour = barber.startHour || 9;
            const endHour = barber.endHour || 18;

            // Generate 30-minute slots
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotTime = new Date(assignmentDate);
                    slotTime.setHours(hour, minute, 0, 0);

                    // Skip past slots
                    if (slotTime < startDate) continue;

                    // Check if slot is available in calendar
                    const isAvailable = await calendarService.isSlotAvailable(
                        new Types.ObjectId(barberId),
                        slotTime,
                        addMinutes(slotTime, 30)
                    );

                    if (isAvailable) {
                        availableSlots.push({
                            date: format(slotTime, 'yyyy-MM-dd'),
                            time: format(slotTime, 'HH:mm'),
                            saloon: assignment.saloon.name
                        });
                    }
                }
            }
        }

        return availableSlots;
    }

    async getSlotsForDay(
        barberId: Types.ObjectId,
        date: Date,
        serviceId: Types.ObjectId,
        numberOfPeople: number = 1
    ): Promise<TimeSlot[]> {
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found');
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        // Calculate total duration based on number of people
        const totalDuration = service.duration * numberOfPeople;

        // Get all appointments for the day
        const appointments = await Appointment.find({
            'staff.id': barberId,
            'dateTime.date': date.toISOString().split('T')[0],
            status: { $ne: 'cancelled' }
        }).populate('service');

        // Convert appointments to booked slots format
        const bookedSlots = appointments.map(app => {
            const populatedApp = app.toObject() as any;
            const start = new Date(`${populatedApp.dateTime.date}T${populatedApp.dateTime.time}`);
            const end = addMinutes(start, populatedApp.service.duration * populatedApp.numberOfPeople);
            return { start: start.toISOString(), end: end.toISOString() };
        });

        // Get day offs
        const dayOffs = await DayOff.find({
            barberId,
            date: date.toISOString().split('T')[0]
        });

        if (dayOffs.length > 0) {
            return [];
        }

        // Get barber's working hours
        const startHour = barber.startHour || BOOKING_CONSTANTS.DEFAULT_START_HOUR;
        const endHour = barber.endHour || BOOKING_CONSTANTS.DEFAULT_END_HOUR;

        // Generate all possible slots
        const slots: TimeSlot[] = [];
        let currentTime = setHours(setMinutes(date, 0), startHour);

        while (currentTime.getHours() < endHour) {
            const slotEndTime = addMinutes(currentTime, totalDuration);
            
            // Use the isSlotBooked method to check for overlaps
            const isSlotBooked = TimeSlotService.isSlotBooked(currentTime, bookedSlots, totalDuration);

            if (!isSlotBooked) {
                slots.push({
                    start: currentTime.toISOString(),
                    end: slotEndTime.toISOString()
                });
            }

            currentTime = addMinutes(currentTime, BOOKING_CONSTANTS.TIME_SLOT_INTERVAL);
        }

        return slots;
    }
} 