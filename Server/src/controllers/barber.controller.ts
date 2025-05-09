import { Request, Response } from 'express';
import { Barber } from '../models/Barber';
import { Service } from '../models/Service';
import { TimeSlotService } from '../services/timeSlotService';
import { CalendarService } from '../services/calendarService';
import { uploadBarberImageToS3 } from '../utils/s3Upload';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';
import { IAppointment } from '../models/Appointment';
import { BarberAssignment } from '../models/BarberAssignment';
import { ParsedQs } from 'qs';

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

interface BarberWithAssignments extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    image?: string;
    role?: string;
    startHour?: number;
    endHour?: number;
    workingDays?: string[];
    calendarId?: string;
    isActive: boolean;
    saloonAssignments: Array<{
        _id: mongoose.Types.ObjectId;
        barber: mongoose.Types.ObjectId;
        saloon: {
            _id: mongoose.Types.ObjectId;
            name: string;
        };
        date: Date;
    }>;
}

interface Assignment {
    _id: mongoose.Types.ObjectId;
    barber: mongoose.Types.ObjectId;
    saloon: {
        _id: mongoose.Types.ObjectId;
        name: string;
    };
    date: Date;
}

export const getBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await Barber.find();
        const assignments = await BarberAssignment.find()
            .populate('saloon')
            .sort({ date: 1 });
        
        // Group assignments by barber
        const barbersWithAssignments = barbers.map(barber => ({
            ...barber.toObject(),
            saloonAssignments: assignments.filter(a => a.barber.toString() === barber._id.toString())
        }));
        
        res.status(200).json(barbersWithAssignments);
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

        const paramDate = new Date(date);
        const targetDate = new Date(paramDate.getFullYear(), paramDate.getMonth(), paramDate.getDate());
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (saloonId === "-1") {
            // Remove assignment
            await BarberAssignment.deleteOne({
                barber: id,
                date: targetDate
            });
        } else {
            // Update or create assignment
            await BarberAssignment.findOneAndUpdate(
                { barber: id, date: targetDate },
                { saloon: new mongoose.Types.ObjectId(saloonId) },
                { upsert: true, new: true }
            );
        }

        // Fetch updated assignments
        const assignments = await BarberAssignment.find({ barber: id })
            .populate('saloon')
            .sort({ date: 1 });

        const updatedBarber = {
            ...barber.toObject(),
            saloonAssignments: assignments
        };

        res.status(200).json(updatedBarber);
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
        const assignments = (barber as unknown as BarberWithAssignments).saloonAssignments.filter(assignment => {
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

        // Get today and tomorrow's dates
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Set up date ranges for both days
        const todayStart = new Date(today);
        todayStart.setHours(0,0,0,0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23,59,59,999);

        const tomorrowStart = new Date(tomorrow);
        tomorrowStart.setHours(0,0,0,0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23,59,59,999);

        // Find assignments for the specified saloon and dates
        const assignments = await BarberAssignment.find({
            saloon: saloonId,
            date: {
                $gte: todayStart,
                $lte: tomorrowEnd
            }
        }).populate('barber');

        // Get unique barbers from assignments
        const barberIds = [...new Set(assignments.map(a => a.barber._id))];
        const barbers = await Barber.find({ _id: { $in: barberIds } });

        // Add assignments to each barber
        const barbersWithAssignments = barbers.map(barber => ({
            ...barber.toObject(),
            saloonAssignments: assignments.filter(a => a.barber._id.toString() === barber._id.toString())
        }));

        res.status(200).json(barbersWithAssignments);
    } catch (error) {
        console.error('Error fetching barbers for saloon:', error);
        res.status(500).json({ error: 'Failed to fetch barbers for saloon' });
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
        const assignment = await BarberAssignment.findOne({
            barber: barberId,
            saloon: saloonId,
            date: new Date(date as string)
        });

        if (!assignment) return res.json([]);

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Get booked slots for the day from MongoDB
        const startOfDayDate = new Date(date as string + 'T00:00:00');
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
        console.error('Error in getBarberDayAvailability:', err);
        res.status(500).json({ error: 'Failed to get availability' });
    }
};