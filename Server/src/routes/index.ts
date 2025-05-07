import { Router } from 'express';
import { setupBarberRoutes } from './barber.routes';
import { setupServiceRoutes } from './service.routes';
import { setupAppointmentRoutes } from './appointment.routes';
import { CalendarService } from '../services/calendarService';
import authRoutes from './auth.routes';
import saloonRoutes from './saloon.routes';

const router = Router();

export const setupRoutes = (calendarService: CalendarService) => {
    console.log('\nInitializing API routes:');
    console.log('======================');
    
    router.use('/auth', authRoutes);
    router.use('/barbers', setupBarberRoutes(calendarService));
    router.use('/services', setupServiceRoutes());
    router.use('/appointments', setupAppointmentRoutes(calendarService));
    router.use('/saloons', saloonRoutes);
    
    console.log('======================\n');
    return router;
}; 