import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { connectDB } from './db/mongodb';
import { CalendarService } from './services/calendarService';
import { Barber } from './models/Barber';

dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

if (!connectDB()) {
    console.error('Failed to connect to MongoDB');
    process.exit(1);
}

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

const calendarService = new CalendarService(oauth2Client);

interface AppointmentRequest {
    barberName: string;
    customerEmail: string;
    customerPhone: string;
    date: string; // format: YYYY-MM-DD HH:MM:SS - HH:MM:SS
    customerName: string;
}

app.get('/barbers', async (req: Request, res: Response): Promise<any> => {
    const barbers = await Barber.find();
    res.status(200).json(barbers);
});

app.post('/barbers', async (req: Request, res: Response): Promise<any> => {
    const { name, email, phone } = req.body;
    const barber = new Barber({ name, email, phone });
    await barber.save();
    res.status(201).json(barber);
});


app.post('/book-appointment', async (req: Request<{}, {}, AppointmentRequest>, res: Response): Promise<any> => {
    const { barberName, customerEmail, customerPhone, date, customerName } = req.body;

    const barber = await Barber.findOne({ name: barberName });
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

        const calendarId = await calendarService.getOrCreateBarberCalendar(barberName);

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

        const response = await calendarService.createAppointment(calendarId, event);

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