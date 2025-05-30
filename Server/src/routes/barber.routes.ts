import { Router, RequestHandler } from 'express';
import { getBarbers, createBarber, getBarberAvailability, updateBarber, deleteBarber, assignSaloon, getBarbersAssignedToSaloon } from '../controllers/barber.controller';
import { CalendarService } from '../services/calendarService';
import { adminAuth } from '../middleware/auth.middleware';
import { barberImageUpload } from '../middleware/upload.middleware';

export const setupBarberRoutes = (calendarService: CalendarService, calendarEnabled: boolean) => {
    const router = Router();
    console.log('Setting up barber routes:');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/barbers');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/barbers');
    console.log('  [\x1b[34mPUT\x1b[0m]    /api/barbers/:id');
    console.log('  [\x1b[31mDELETE\x1b[0m] /api/barbers/:id');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/barbers/:barberName/availability');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/barbers/:id/assign-saloon');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/barbers/assigned');

    router.get('/', async (req, res) => { await getBarbers(req, res); });
    router.post('/', adminAuth, barberImageUpload.single('image'), async (req, res) => { await createBarber(req, res); });
    router.put('/:id', adminAuth, barberImageUpload.single('image'), async (req, res) => { await updateBarber(req, res); });
    router.delete('/:id', adminAuth, async (req, res) => { await deleteBarber(req, res); });
    router.post('/:id/assign-saloon', adminAuth, async (req, res) => { await assignSaloon(req, res); });
    router.get('/assigned', getBarbersAssignedToSaloon);

    const availabilityHandler: RequestHandler = async (req, res, next) => {
        try {
            await getBarberAvailability(req, res, calendarService);
        } catch (error) {
            next(error);
        }
    };
    router.get('/:barberName/availability', availabilityHandler);

    // Add new endpoint for day availability
    router.get('/:barberId/availability/day', async (req, res) => {
        await require('../controllers/barber.controller').getBarberDayAvailability(req, res, calendarService);
    });

    console.log('======================');
    return router;
}; 