import { Router, RequestHandler } from 'express';
import { bookAppointment } from '../controllers/appointment.controller';
import { CalendarService } from '../services/calendarService';
import Appointment from '../models/Appointment';

export const setupAppointmentRoutes = (calendarService: CalendarService) => {
    const router = Router();

    console.log('Setting up appointment routes:');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/appointments/book');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/appointments');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/appointments/:id');

    const bookHandler: RequestHandler = async (req, res, next) => {
        try {
            await bookAppointment(req, res, calendarService);
        } catch (error) {
            next(error);
        }
    };

    const getAppointmentsHandler: RequestHandler = async (req, res) => {
        try {
            const appointments = await Appointment.find()
                .populate('service')
                .sort({ 'dateTime.date': 1, 'dateTime.time': 1 });
            res.json(appointments);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch appointments' });
        }
    };

    const getAppointmentByIdHandler: RequestHandler = async (req, res) => {
        try {
            const appointment = await Appointment.findById(req.params.id)
                .populate('service');
            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }
            res.json(appointment);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch appointment' });
        }
    };

    router.post('/book', bookHandler);
    router.get('/', getAppointmentsHandler);
    router.get('/:id', getAppointmentByIdHandler);

    return router;
}; 