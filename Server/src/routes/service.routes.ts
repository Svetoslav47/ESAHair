import { Router } from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/service.controller';
import { adminAuth } from '../middleware/auth.middleware';
import { serviceImageUpload } from '../middleware/upload.middleware';

export const setupServiceRoutes = () => {
    const router = Router();

    console.log('Setting up service routes:');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/services');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/services');
    console.log('  [\x1b[34mPUT\x1b[0m]    /api/services/:id');
    console.log('  [\x1b[31mDELETE\x1b[0m] /api/services/:id');

    router.get('/', getServices);
    router.post('/', adminAuth, serviceImageUpload.single('image'), createService);
    router.put('/:id', adminAuth, serviceImageUpload.single('image'), updateService);
    router.delete('/:id', adminAuth, deleteService);

    console.log('======================');
    return router;
}; 