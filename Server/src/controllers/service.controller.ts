import { Request, Response } from 'express';
import { Service } from '../models/Service';

export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Failed to get services' });
    }
}; 