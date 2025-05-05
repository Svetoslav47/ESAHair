import express from 'express';
import { createAppointment, getAppointments, getAppointmentById } from '../controllers/appointmentController';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);

export default router; 