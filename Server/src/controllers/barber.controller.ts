import { Request, Response } from 'express';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';
import { uploadBarberImageToS3 } from '../utils/s3Upload';
import { addDays, startOfDay, endOfDay } from 'date-fns';

export const getBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await Barber.find().populate('saloonAssignments.saloon');
        res.status(200).json(barbers);
    } catch (error) {
        console.error('Error fetching barbers:', error);
        res.status(500).json({ error: 'Failed to fetch barbers' });
    }
};

export const createBarber = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, role, startHour, endHour, isActive } = req.body;
        let image = undefined;
        if (req.file) {
            image = await uploadBarberImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const barber = new Barber({ 
            name, 
            email, 
            phone, 
            role, 
            startHour, 
            endHour, 
            image,
            isActive: isActive !== undefined ? isActive : true
        });
        await barber.save();
        res.status(201).json(barber);
    } catch (error) {
        console.error('Error creating barber:', error);
        res.status(500).json({ error: 'Failed to create barber' });
    }
};

export const updateBarber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, startHour, endHour, isActive } = req.body;
        let updateData: any = { name, role, startHour, endHour, isActive };
        updateData.email = email === '' ? null : email;
        updateData.phone = phone === '' ? null : phone;
        if (req.file) {
            updateData.image = await uploadBarberImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const barber = await Barber.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }
        res.status(200).json(barber);
    } catch (error) {
        console.error('Error updating barber:', error);
        res.status(500).json({ error: 'Failed to update barber' });
    }
};

export const deleteBarber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const barber = await Barber.findByIdAndDelete(id);
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }
        res.status(200).json({ message: 'Barber deleted' });
    } catch (error) {
        console.error('Error deleting barber:', error);
        res.status(500).json({ error: 'Failed to delete barber' });
    }
};

export const assignSaloon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { saloonId, date } = req.body;
        
        const barber = await Barber.findById(id);
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }

        // Remove any existing assignment for this date
        barber.saloonAssignments = barber.saloonAssignments.filter(
            assignment => assignment.date.toISOString() !== new Date(date).toISOString()
        );

        // Add new assignment
        barber.saloonAssignments.push({
            date: new Date(date),
            saloon: saloonId
        });

        await barber.save();
        res.status(200).json(barber);
    } catch (error) {
        console.error('Error assigning saloon:', error);
        res.status(500).json({ error: 'Failed to assign saloon' });
    }
};

export const getBarberAvailability = async (req: Request, res: Response, calendarService: CalendarService) => {
    try {
        const { barberName } = req.params;
        const barber = await Barber.findOne({ name: barberName });
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }

        // Get today and tomorrow's dates
        const today = startOfDay(new Date());
        const tomorrow = endOfDay(addDays(today, 1));

        // Get barber's assignments for today and tomorrow
        const assignments = barber.saloonAssignments.filter(assignment => {
            const assignmentDate = new Date(assignment.date);
            return assignmentDate >= today && assignmentDate <= tomorrow;
        });

        // Get available time slots
        const availableSlots = await TimeSlotService.getAvailableSlots(
            barber._id,
            today,
            tomorrow,
            calendarService
        );

        res.status(200).json({
            barber,
            assignments,
            availableSlots
        });
    } catch (error) {
        console.error('Error getting barber availability:', error);
        res.status(500).json({ error: 'Failed to get barber availability' });
    }
};