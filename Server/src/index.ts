import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { connectDB } from './db/mongodb';
import { CalendarService } from './services/calendarService';
import { Barber } from './models/Barber';
import { TimeSlotService } from './services/timeSlotService';
import { Service } from './models/Service';
import { addMinutes } from 'date-fns';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
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
    date: Date;
    customerName: string;
    serviceId: string;
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

// body: JSON.stringify({
//     barberName: staff?.name,
//     customerEmail: details?.email,
//     customerPhone: details?.phone,
//     customerName: details?.firstname + ' ' + details?.lastname,
//     date: dateTime?.start,
//     serviceId: service?._id
//   })
app.post('/book-appointment', async (req: Request<{}, {}, AppointmentRequest>, res: Response): Promise<any> => {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing request body' });
    }
    
    const { barberName, customerEmail, customerPhone, date, customerName, serviceId } = req.body;

    const barber = await Barber.findOne({ name: barberName });
    if (!barber) {
        return res.status(404).json({ error: 'Barber not found' });
    }

    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    if (!customerEmail || !customerPhone || !date) {
        return res.status(400).json({ error: 'Missing customerEmail, customerPhone, or date' });
    }

    try {
        const startDateTime = date;
        const endDateTime = addMinutes(date, service.duration);

        const calendarId = await calendarService.getOrCreateBarberCalendar(barberName);

        const event = {
            summary: `${service.name} with ${barber.name}`,
            description: `Customer: ${customerName}, Phone: ${customerPhone}, Email: ${customerEmail}\nBarber: ${barber.name}`,
            start: {
                dateTime: startDateTime,
                timeZone: 'Europe/Sofia',
            },
            end: {
                dateTime: endDateTime,
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

app.get('/barber/:name/availability', async (req: Request, res: Response): Promise<any> => {
    try {
        const { name } = req.params;
        const { serviceId } = req.query;

        const service = await Service.findOne({ _id: serviceId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        const procedureLength = service.duration;

        // Find barber
        const barber = await Barber.findOne({ name });
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }

        
        // Generate available time slots
        const timeSlots = await TimeSlotService.generateAvailableTimeSlots(
            new Date(), // Start from today
            barber.workingDays,
            barber.startHour,
            barber.endHour,
            barber._id,
            procedureLength,
            calendarService
        );

        res.status(200).json(timeSlots);
    } catch (error) {
        console.error('Error getting working hours:', error);
        res.status(500).json({ error: 'Failed to get working hours' });
    }
});

app.get('/services', async (req: Request, res: Response): Promise<any> => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Failed to get services' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});