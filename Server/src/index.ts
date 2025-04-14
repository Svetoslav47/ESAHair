import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

// Create OAuth2 client with proper credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Set the refresh token
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_STUDIO_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/calendar',
    token_type: 'Bearer'
});

const barbers = [
    { id: '1', name: 'Alex', email: 'svetoslav.iliev07@gmail.com', phone: '0888000001' },
    { id: '2', name: 'Mila', email: 'mila@barbershop.com', phone: '0888000002' },
    { id: '3', name: 'Tony', email: 'tony@barbershop.com', phone: '0888000003' },
];

interface AppointmentRequest {
    barberName: string;
    customerEmail: string;
    customerPhone: string;
    date: string; // format: YYYY-MM-DD HH:MM:SS - HH:MM:SS
    customerName: string;
}

app.post('/book-appointment', async (req: Request<{}, {}, AppointmentRequest>, res: Response): Promise<any> => {
    const { barberName, customerEmail, customerPhone, date, customerName } = req.body;

    const barber = barbers.find((b) => b.name.toLowerCase() === barberName.toLowerCase());
    if (!barber) {
        return res.status(404).json({ error: 'Barber not found' });
    }

    if (!customerEmail || !customerPhone || !date) {
        return res.status(400).json({ error: 'Missing customerEmail, customerPhone, or date' });
    }

    try {
        const [datePart, startTime, _, endTime] = date.split(' ');
        const startDateTime = new Date(`${datePart}T${startTime}`);
        const endDateTime = new Date(`${datePart}T${endTime}`);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Get list of calendars
        const calendarList = await calendar.calendarList.list();
        
        // Find the barber's calendar by name
        let barberCalendar = calendarList.data.items?.find(
            cal => cal.summary?.toLowerCase() === barberName.toLowerCase()
        );

        if (!barberCalendar) {
            const newCalendar = await calendar.calendars.insert({
                requestBody: {
                    summary: barberName,
                },
            });
            barberCalendar = newCalendar.data;
        }

        const event = {
            summary: `Haircut with ${barber.name}`,
            description: `Customer: ${customerName}, Phone: ${customerPhone}, Email: ${customerEmail}\nBarber: ${barber.name}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Europe/Sofia',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Europe/Sofia',
            },
            attendees: [{ email: customerEmail }],
        };

        const response = await calendar.events.insert({
            calendarId: barberCalendar.id || 'primary',
            requestBody: event
        });

        res.status(200).json({
            message: 'Appointment booked and event added!',
            calendarEvent: response.data.htmlLink,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});