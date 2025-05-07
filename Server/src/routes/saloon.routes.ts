import { Router } from 'express';
import { getSaloons, createSaloon, updateSaloon, deleteSaloon } from '../controllers/saloon.controller';
import { adminAuth } from '../middleware/auth.middleware';
import { barberImageUpload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', async (req, res) => { await getSaloons(req, res); });
router.post('/', adminAuth, barberImageUpload.single('image'), async (req, res) => { await createSaloon(req, res); });
router.put('/:id', adminAuth, barberImageUpload.single('image'), async (req, res) => { await updateSaloon(req, res); });
router.delete('/:id', adminAuth, async (req, res) => { await deleteSaloon(req, res); });

export default router; 