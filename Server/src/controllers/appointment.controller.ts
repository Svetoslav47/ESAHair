import { Request, Response } from 'express';
import { addMinutes } from 'date-fns';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';
import { AppointmentRequest } from '../types/appointment.types';
import Appointment from '../models/Appointment';

export const bookAppointment = async (req: Request<{}, {}, AppointmentRequest>, res: Response, calendarService: CalendarService) => {
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

    const isSlotBooked = await TimeSlotService.isSlotBookedSpecificDate(date, service.duration, calendarService, barber._id);
    if (isSlotBooked) {
        return res.status(400).json({ error: 'Slot already booked' });
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

        // Save appointment to MongoDB
        const appointment = new Appointment({
            service: service._id,
            staff: {
                id: barber._id,
                name: barber.name
            },
            dateTime: {
                date: new Date(date).toISOString().split('T')[0],
                time: new Date(date).toTimeString().split(' ')[0]
            },
            customer: {
                firstname: customerName.split(' ')[0],
                lastname: customerName.split(' ').slice(1).join(' '),
                email: customerEmail,
                phone: customerPhone
            },
            status: 'confirmed'
        });

        await appointment.save();

        res.status(200).json({
            message: 'Appointment booked and event added!',
            calendarEvent: response.data.htmlLink,
            bookingId: response.data.id,
            appointmentId: appointment._id
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
}; 