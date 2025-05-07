import { google } from 'googleapis';
import { Barber } from '../models/Barber';
import { endOfDay, startOfDay, addMinutes } from 'date-fns';
import { Types } from 'mongoose';
export interface BookedSlot {
    start: string;
    end: string;
}

export class CalendarService {
    private calendar;

    constructor(private oauth2Client: any) {
        this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    }

    async getOrCreateBarberCalendar(barberName: string): Promise<string> {
        // First check if we already have the calendar ID in the database
        const barber = await Barber.findOne({ name: barberName });
        if (barber?.calendarId) {
            return barber.calendarId;
        }

        // If not, get list of calendars and find matching one
        const calendarList = await this.calendar.calendarList.list();
        const existingCalendar = calendarList.data.items?.find(
            cal => cal.summary?.toLowerCase() === barberName.toLowerCase()
        );

        if (existingCalendar?.id) {
            // Update the barber record with the calendar ID
            await Barber.findOneAndUpdate(
                { name: barberName },
                { calendarId: existingCalendar.id },
                { upsert: true }
            );
            return existingCalendar.id;
        }

        // If no calendar exists, create a new one
        const newCalendar = await this.calendar.calendars.insert({
            requestBody: {
                summary: barberName,
            },
        });

        if (newCalendar.data.id) {
            // Update the barber record with the new calendar ID
            await Barber.findOneAndUpdate(
                { name: barberName },
                { calendarId: newCalendar.data.id },
                { upsert: true }
            );
            return newCalendar.data.id;
        }

        throw new Error('Failed to create calendar');
    }

    async getBarberAppointments(barberId: Types.ObjectId, startDate: Date, endDate: Date): Promise<Record<string, BookedSlot[]>> {
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found');
        }
        const calendarID = await this.getOrCreateBarberCalendar(barber.name);

        const timeMin = startOfDay(startDate).toISOString();
        const timeMax = endOfDay(endDate).toISOString();

        try {
            const response = await this.calendar.events.list({
                calendarId: calendarID,
                timeMin,
                timeMax,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const bookingsByDate: Record<string, BookedSlot[]> = {};
            
            (response.data.items || [])
                .filter(event => event.start?.dateTime && event.end?.dateTime)
                .forEach(event => {
                    const startDateTime = event.start!.dateTime!;
                    const endDateTime = event.end!.dateTime!;
                    const date = startDateTime.split('T')[0]; // Get just the date part
                    
                    if (!bookingsByDate[date]) {
                        bookingsByDate[date] = [];
                    }
                    
                    bookingsByDate[date].push({
                        start: startDateTime,
                        end: endDateTime
                    });
                });

            return bookingsByDate;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return {};
        }
    }

    async createAppointment(calendarId: string, event: any) {
        return await this.calendar.events.insert({
            calendarId,
            requestBody: event
        });
    }

    async isSlotAvailable(barberId: Types.ObjectId, startTime: Date, endTime: Date): Promise<boolean> {
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found');
        }

        const calendarId = await this.getOrCreateBarberCalendar(barber.name);
        const timeMin = startTime.toISOString();
        const timeMax = endTime.toISOString();

        try {
            const response = await this.calendar.events.list({
                calendarId,
                timeMin,
                timeMax,
                singleEvents: true,
                orderBy: 'startTime',
            });

            // If there are any events in this time slot, it's not available
            return !response.data.items || response.data.items.length === 0;
        } catch (error) {
            console.error('Error checking slot availability:', error);
            return false;
        }
    }
} 