import { Router, RequestHandler } from 'express';
import { bookAppointment } from '../controllers/appointment.controller';
import { CalendarService } from '../services/calendarService';
import Appointment from '../models/Appointment';

export const setupAppointmentRoutes = (calendarService: CalendarService, calendarEnabled: boolean) => {
    const router = Router();

    console.log('Setting up appointment routes:');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/appointments/book');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/appointments');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/appointments/:id');
    console.log('  [\x1b[32mDELETE\x1b[0m] /api/appointments/:id');
    
    const bookHandler: RequestHandler = async (req, res, next) => {
        try {
            await bookAppointment(req, res, calendarService, calendarEnabled);
        } catch (error) {
            next(error);
        }
    };

    const getAppointmentsHandler: RequestHandler = async (req, res) => {
    try {
        // 1. Calculate the date range
        const today = new Date();

        // Start of yesterday (setting hours to 00:00:00 for the start of the day)
        const startOfYesterday = new Date(today);
        startOfYesterday.setDate(today.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);

        // End of 5 days in advance (setting hours to 23:59:59 for the end of the day)
        const endOfFiveDaysAdvance = new Date(today);
        endOfFiveDaysAdvance.setDate(today.getDate() + 5);
        endOfFiveDaysAdvance.setHours(23, 59, 59, 999); // 999 milliseconds for end of day

        // 2. Build the query
        const query = {
            'dateTime.date': {
                $gte: startOfYesterday,
                $lte: endOfFiveDaysAdvance,
            },
        };

        // 3. Execute the query
        const appointments = await Appointment.find(query)
            .populate('service')
            .sort({ 'dateTime.date': 1, 'dateTime.time': 1 }); // Still good to sort for consistency

        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error); // Log the actual error
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};
    // @ts-ignore
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

    const deleteAppointmentHandler: RequestHandler = async (req, res) => {
        try {
            await Appointment.findByIdAndDelete(req.params.id);
            res.json({ message: 'Appointment deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete appointment' });
        }
    };

    router.post('/book', bookHandler);
    router.get('/', getAppointmentsHandler);
    router.get('/:id', getAppointmentByIdHandler);
    router.delete('/:id', deleteAppointmentHandler);
    return router;
}; 
