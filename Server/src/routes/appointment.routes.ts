import { Router, RequestHandler } from 'express';
import { bookAppointment } from '../controllers/appointment.controller';
import { CalendarService } from '../services/calendarService';

export const setupAppointmentRoutes = (calendarService: CalendarService) => {
    const router = Router();

    console.log('Setting up appointment routes:');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/appointments/book');

    const bookHandler: RequestHandler = async (req, res, next) => {
        try {
            await bookAppointment(req, res, calendarService);
        } catch (error) {
            next(error);
        }
    };
    router.post('/book', bookHandler);

    return router;
}; 