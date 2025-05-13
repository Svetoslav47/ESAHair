import { Request, Response } from 'express';
import { addMinutes } from 'date-fns';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';
import { AppointmentRequest } from '../types/appointment.types';
import Appointment from '../models/Appointment';
import { Types } from 'mongoose';

export const bookAppointment = async (req: Request<{}, {}, AppointmentRequest>, res: Response, calendarService: CalendarService, calendarEnabled: boolean) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing request body' });
    }
    
    const { barberName, customerEmail, customerPhone, date, customerName, serviceId, duration } = req.body;

    const barber = await Barber.findOne({ name: barberName });
    if (!barber) {
        return res.status(404).json({ error: 'Barber not found' });
    }

    const service = await Service.findOne({ _id: new Types.ObjectId(serviceId) });
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    // Only check DB for slot availability
    const isSlotBooked = await Appointment.findOne({
        'staff.id': barber._id,
        'dateTime.date': appointmentDate.toISOString().split('T')[0],
        'dateTime.time': appointmentDate.toTimeString().split(' ')[0],
        status: { $ne: 'cancelled' }
    });
    if (isSlotBooked) {
        return res.status(400).json({ error: 'Slot already booked' });
    }

    if (!customerPhone || !date) {
        return res.status(400).json({ error: 'Missing customerPhone or date' });
    }

    let calendarEvent = null;
    let bookingId = null;
    let calendarError = null;
    if (calendarEnabled && calendarService) {
        try {
            const startDateTime = appointmentDate;
            const endDateTime = addMinutes(appointmentDate, service.duration * (duration || 1));
            const calendarId = await calendarService.getOrCreateBarberCalendar(barberName);
            const event = {
                summary: `${service.name} with ${barber.name} (${duration || 1} ${duration === 1 ? 'person' : 'people'})`,
                description: `Customer: ${customerName}, Phone: ${customerPhone}, Email: ${customerEmail}\nBarber: ${barber.name}\nDuration: ${duration || 1} ${duration === 1 ? 'person' : 'people'}`,
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
            calendarEvent = response.data.htmlLink;
            bookingId = response.data.id;
        } catch (err) {
            console.error('Google Calendar error:', err);
            calendarError = 'Google Calendar event could not be created.';
        }
    }

    // Save appointment to MongoDB
    const appointment = new Appointment({
        service: service._id,
        staff: {
            id: barber._id,
            name: barber.name
        },
        dateTime: {
            date: appointmentDate.toISOString().split('T')[0],
            time: appointmentDate.toTimeString().split(' ')[0]
        },
        customer: {
            firstname: customerName.split(' ')[0],
            lastname: customerName.split(' ').slice(1).join(' '),
            email: customerEmail,
            phone: customerPhone
        },
        duration: duration || 1,
        status: 'confirmed'
    });
    await appointment.save();

    // Emit socket event for new appointment with populated service
    const io = req.app.get('io');
    if (io) {
      const populatedAppointment = await Appointment.findById(appointment._id).populate('service');
      io.emit('appointment:new', populatedAppointment);
    }

    res.status(200).json({
        message: 'Appointment booked.' + (calendarError ? ' (Google Calendar event failed)' : calendarEvent ? ' and event added!' : ''),
        calendarEvent,
        bookingId,
        appointmentId: appointment._id,
        calendarError
    });
}; 