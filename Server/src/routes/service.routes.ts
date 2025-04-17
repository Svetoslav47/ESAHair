import { Router } from 'express';
import { getServices } from '../controllers/service.controller';

export const setupServiceRoutes = () => {
    const router = Router();

    console.log('Setting up service routes:');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/services');

    router.get('/', getServices);

    console.log('======================');
    return router;
}; 