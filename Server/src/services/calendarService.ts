import { google } from 'googleapis';
import { Barber } from '../models/Barber';

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

    async createAppointment(calendarId: string, event: any) {
        return await this.calendar.events.insert({
            calendarId,
            requestBody: event
        });
    }
} 