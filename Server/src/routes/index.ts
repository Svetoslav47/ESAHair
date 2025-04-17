import { Router } from 'express';
import { setupBarberRoutes } from './barber.routes';
import { setupServiceRoutes } from './service.routes';
import { setupAppointmentRoutes } from './appointment.routes';
import { CalendarService } from '../services/calendarService';

const router = Router();

export const setupRoutes = (calendarService: CalendarService) => {
    console.log('\nInitializing API routes:');
    console.log('======================');
    
    router.use('/barbers', setupBarberRoutes(calendarService));
    router.use('/services', setupServiceRoutes());
    router.use('/appointments', setupAppointmentRoutes(calendarService));
    
    console.log('======================\n');
    return router;
}; 