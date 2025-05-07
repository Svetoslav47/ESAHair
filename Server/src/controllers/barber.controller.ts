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

        console.log('date:', date);
        const paramDate = new Date(date);
        console.log('paramDate:', paramDate);
        const targetDate = new Date(paramDate.getFullYear(), paramDate.getMonth(), paramDate.getDate());
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Remove any existing assignment for this date
        await Barber.updateOne(
            { _id: id },
            { $pull: { saloonAssignments: { date: targetDate } } }
        );

        // If saloonId is not "-1", add the new assignment
        if (saloonId !== "-1") {
            const newAssignment = {
                date: targetDate,
                saloon: new mongoose.Types.ObjectId(saloonId)
            };

            await Barber.updateOne(
                { _id: id },
                { $push: { saloonAssignments: newAssignment } }
            );
        }

        // Fetch and return the updated barber
        const updatedBarber = await Barber.findById(id).populate('saloonAssignments.saloon');
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
        
        console.log('getBarbersAssignedToSaloon params:', { 
            saloonId, 
            date,
            todayStart: todayStart.toISOString(),
            todayEnd: todayEnd.toISOString(),
            tomorrowStart: tomorrowStart.toISOString(),
            tomorrowEnd: tomorrowEnd.toISOString()
        });

        // First, let's check if there are any barbers at all
        const allBarbers = await Barber.find({});
        console.log('Total barbers in system:', allBarbers.length);
        
        // Debug each barber's assignments in detail
        allBarbers.forEach(barber => {
            console.log('\nBarber:', barber.name);
            console.log('Assignments:', JSON.stringify(barber.saloonAssignments, null, 2));
            
            // Check each assignment against our criteria
            barber.saloonAssignments.forEach(assignment => {
                const assignmentDate = new Date(assignment.date);
                const isTodayMatch = assignmentDate >= todayStart && assignmentDate <= todayEnd;
                const isTomorrowMatch = assignmentDate >= tomorrowStart && assignmentDate <= tomorrowEnd;
                const isSaloonMatch = assignment.saloon.toString() === saloonId;
                
                console.log('Assignment check for', barber.name, ':', {
                    assignmentDate: assignmentDate.toISOString(),
                    assignmentSaloonId: assignment.saloon.toString(),
                    requestedSaloonId: saloonId,
                    isTodayMatch,
                    isTomorrowMatch,
                    isSaloonMatch
                });
            });
        });

        // Find barbers with a saloon assignment for this saloon and either today or tomorrow
        const query = {
            saloonAssignments: {
                $elemMatch: {
                    saloon: new mongoose.Types.ObjectId(saloonId as string),
                    $or: [
                        {
                            date: {
                                $gte: todayStart,
                                $lte: todayEnd
                            }
                        },
                        {
                            date: {
                                $gte: tomorrowStart,
                                $lte: tomorrowEnd
                            }
                        }
                    ]
                }
            }
        };
        
        console.log('\nMongoDB Query:', JSON.stringify(query, null, 2));
        
        const barbers = await Barber.find(query);

        console.log('\nFound barbers:', barbers.length);
        barbers.forEach(barber => {
            console.log('Found barber:', barber.name);
            console.log('Their assignments:', JSON.stringify(barber.saloonAssignments, null, 2));
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

    console.log('getBarberDayAvailability params:', {
      barberId,
      saloonId,
      serviceId,
      date
    });

    if (!barberId || !saloonId || !serviceId || !date) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    console.log('Found barber:', {
      name: barber.name,
      assignments: barber.saloonAssignments
    });

    // Check assignment
    const assigned = barber.saloonAssignments.some(
      (assignment: SaloonAssignment) => {
        const assignmentDate = assignment.date.toISOString().slice(0, 10);
        const isMatch = assignment.saloon.toString() === saloonId && assignmentDate === date;
        console.log('Checking assignment:', {
          assignmentDate,
          requestedDate: date,
          assignmentSaloonId: assignment.saloon.toString(),
          requestedSaloonId: saloonId,
          isMatch
        });
        return isMatch;
      }
    );
    
    console.log('Is barber assigned for this date and saloon:', assigned);
    
    // If not assigned, return empty array instead of error
    if (!assigned) return res.json([]);

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Get booked slots for the day from MongoDB
    const startOfDayDate = new Date(date + 'T00:00:00');
    const appointments = await require('../models/Appointment').default.find({
      'staff.id': barber._id,
      'dateTime.date': date,
      status: { $ne: 'cancelled' }
    });

    console.log('Found appointments:', appointments.length);

    const bookedSlots = appointments.map((app: IAppointment) => {
      const start = new Date(`${app.dateTime.date}T${app.dateTime.time}`);
      const end = new Date(start.getTime() + (service.duration * 60000));
      return { start: start.toISOString(), end: end.toISOString() };
    });

    console.log('Booked slots:', bookedSlots);

    const slots = await TimeSlotService.generateTimeSlotsForDay(
      startOfDayDate,
      barber.startHour || 9,
      barber.endHour || 18,
      service.duration,
      bookedSlots
    );

    console.log('Generated time slots:', slots.length);
    res.json(slots);
  } catch (err) {
    console.error('Error in getBarberDayAvailability:', err);
    res.status(500).json({ error: 'Failed to get availability' });
  }
};