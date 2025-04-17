import { Request, Response } from 'express';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';

export const getBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await Barber.find();
        res.status(200).json(barbers);
    } catch (error) {
        console.error('Error fetching barbers:', error);
        res.status(500).json({ error: 'Failed to fetch barbers' });
    }
};

export const createBarber = async (req: Request, res: Response) => {
    try {
        const { name, email, phone } = req.body;
        const barber = new Barber({ name, email, phone });
        await barber.save();
        res.status(201).json(barber);
    } catch (error) {
        console.error('Error creating barber:', error);
        res.status(500).json({ error: 'Failed to create barber' });
    }
}; 

export const getBarberAvailability = async (req: Request, res: Response, calendarService: CalendarService) => {
    try {
        const { barberName } = req.params;
        const { serviceId } = req.query;

        const service = await Service.findOne({ _id: serviceId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        const procedureLength = service.duration;

        const barber = await Barber.findOne({ name: barberName });
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }

        const timeSlots = await TimeSlotService.generateAvailableTimeSlots(
            new Date(),
            barber.workingDays,
            barber.startHour,
            barber.endHour,
            barber._id,
            procedureLength,
            calendarService
        );

        res.status(200).json(timeSlots);
    } catch (error) {
        console.error('Error getting working hours:', error);
        res.status(500).json({ error: 'Failed to get working hours' });
    }
};