import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { uploadServiceImageToS3 } from '../utils/s3Upload';

interface ServiceUpdateData {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    image?: string;
    sortOrder?: number;
}

export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.find().sort({ sortOrder: -1, name: 1 });
        res.status(200).json(services);
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Failed to get services' });
    }
};

export const createService = async (req: Request, res: Response) => {
    try {
        const { name, description, length, price, sortOrder } = req.body;
        let image = undefined;
        if (req.file) {
            image = await uploadServiceImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const service = new Service({
            name,
            description,
            duration: length,
            price,
            image,
            sortOrder: sortOrder || 0
        });
        await service.save();
        res.status(201).json(service);
        return;
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
        return;
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, length, price, sortOrder } = req.body;
        const updateData: ServiceUpdateData = { 
            name, 
            description, 
            duration: length, 
            price,
            sortOrder: sortOrder !== undefined ? sortOrder : undefined
        };
        if (req.file) {
            updateData.image = await uploadServiceImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const service = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.status(200).json(service);
        return;
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
        return;
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.status(200).json({ message: 'Service deleted' });
        return;
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
        return;
    }
}; 