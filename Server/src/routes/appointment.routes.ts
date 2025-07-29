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
        const today = new Date();

        // Start of yesterday
        const startOfYesterday = new Date(today);
        startOfYesterday.setDate(today.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);

        // End of 5 days in advance
        const endOfFiveDaysAdvance = new Date(today);
        endOfFiveDaysAdvance.setDate(today.getDate() + 5);
        endOfFiveDaysAdvance.setHours(23, 59, 59, 999);

        // Convert the Date objects to YYYY-MM-DD strings for comparison
        // This is important because your stored dates are strings without time components
        const startOfYesterdayString = startOfYesterday.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const endOfFiveDaysAdvanceString = endOfFiveDaysAdvance.toISOString().slice(0, 10); // "YYYY-MM-DD"

        const appointments = await Appointment.aggregate([
            {
                $addFields: {
                    // Convert 'dateTime.date' string to a proper Date object
                    convertedDate: {
                        $dateFromString: {
                            dateString: '$dateTime.date',
                            format: '%Y-%m-%d', // Specify the format of your date string
                            // You can add onError/onNull if needed for error handling of malformed strings
                            // onError: null,
                            // onNull: null
                        },
                    },
                },
            },
            {
                $match: {
                    'convertedDate': {
                        $gte: new Date(startOfYesterdayString), // Convert the string back to Date for comparison
                        $lte: new Date(endOfFiveDaysAdvanceString), // Convert the string back to Date for comparison
                    },
                },
            },
            {
                $lookup: {
                    from: 'services', // The name of your service collection (lowercase and plural by default)
                    localField: 'service', // The field in the appointments collection
                    foreignField: '_id', // The field in the services collection
                    as: 'service', // The array field to add to the input documents
                },
            },
            {
                $unwind: {
                    path: '$service', // Unwind the service array to get a single service object
                    preserveNullAndEmptyArrays: true // Keep appointments even if service is null
                }
            },
            {
                $sort: {
                    'convertedDate': 1, // Sort by the converted date
                    'dateTime.time': 1, // Then by the original time string (if it's also a string and sortable)
                },
            },
            {
                $project: {
                    // Remove the temporary convertedDate field if you don't need it in the final output
                    convertedDate: 0,
                },
            },
        ]);

        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
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
