import { Request, Response } from 'express';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';
import { uploadBarberImageToS3 } from '../utils/s3Upload';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';
import { IAppointment } from '../models/Appointment';

interface BarberUpdateData {
    name?: string;
    email?: string | null;
    phone?: string | null;
    role?: string;
    startHour?: number;
    endHour?: number;
    isActive?: boolean;
    image?: string;
}

interface SaloonAssignment {
    date: Date;
    saloon: mongoose.Types.ObjectId;
}

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
        const updateData: BarberUpdateData = { name, role, startHour, endHour, isActive };
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
        
        if (!saloonId || !date) {
            return res.status(400).json({ error: 'saloonId and date are required' });
        }

        const barber = await Barber.findById(id);
        if (!barber) {
            return res.status(404).json({ error: 'Barber not found' });
        }

        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Remove any existing assignment for this date
        const existingAssignmentIndex = barber.saloonAssignments.findIndex(
            assignment => assignment.date.toISOString() === targetDate.toISOString()
        );
        if (existingAssignmentIndex !== -1) {
            barber.saloonAssignments.splice(existingAssignmentIndex, 1);
        }

        // Add new assignment with proper ObjectId
        const newAssignment: SaloonAssignment = {
            date: targetDate,
            saloon: new mongoose.Types.ObjectId(saloonId)
        };
        barber.saloonAssignments.addToSet(newAssignment);

        await barber.save();
        res.status(200).json(barber);
    } catch (error) {
        console.error('Error assigning saloon:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: 'Invalid salon ID format' });
        }
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
            barber._id.toString(),
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

export const getBarbersAssignedToSaloon = async (req: Request, res: Response) => {
    try {
        const { saloonId, date } = req.query;
        if (!saloonId || !date) {
            res.status(400).json({ error: 'saloonId and date are required' });
            return;
        }
        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23,59,59,999);
        console.log('getBarbersAssignedToSaloon:', { saloonId, date, startOfDay, endOfDay });
        // Find barbers with a saloon assignment for this saloon and date (date part only)
        const barbers = await Barber.find({
            saloonAssignments: {
                $elemMatch: {
                    saloon: saloonId,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            }
        });
        // Log assignments for debugging
        barbers.forEach(barber => {
            console.log('Barber:', barber.name, 'Assignments:', barber.saloonAssignments);
        });
        res.status(200).json(barbers);
        return;
    } catch (error) {
        console.error('Error fetching barbers for saloon:', error);
        res.status(500).json({ error: 'Failed to fetch barbers for saloon' });
        return;
    }
};

export const getBarberDayAvailability = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    const { saloonId, serviceId, date } = req.query;

    if (!barberId || !saloonId || !serviceId || !date) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    // Check assignment
    const assigned = barber.saloonAssignments.some(
      (assignment: SaloonAssignment) => assignment.saloon.toString() === saloonId && assignment.date.toISOString().slice(0, 10) === date
    );
    if (!assigned) return res.status(404).json({ error: 'Barber not assigned to this saloon on this date' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Get booked slots for the day from MongoDB
    const startOfDayDate = new Date(date + 'T00:00:00');
    const appointments = await require('../models/Appointment').default.find({
      'staff.id': barber._id,
      'dateTime.date': date,
      status: { $ne: 'cancelled' }
    });
    const bookedSlots = appointments.map((app: IAppointment) => {
      const start = new Date(`${app.dateTime.date}T${app.dateTime.time}`);
      const end = new Date(start.getTime() + (service.duration * 60000));
      return { start: start.toISOString(), end: end.toISOString() };
    });
    const slots = await TimeSlotService.generateTimeSlotsForDay(
      startOfDayDate,
      barber.startHour || 9,
      barber.endHour || 18,
      service.duration,
      bookedSlots
    );
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get availability' });
  }
};