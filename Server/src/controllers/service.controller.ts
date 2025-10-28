import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { uploadServiceImageToS3 } from '../utils/s3Upload';

interface ServiceUpdateData {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    priceEUR?: number;
    priceBGN?: number;
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
        const { name, description, length, priceEUR, priceBGN, price, sortOrder } = req.body;
        let image = undefined;
        if (req.file) {
            image = await uploadServiceImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        
        // Conversion rate: 1 EUR = 1.95583 BGN
        const CONVERSION_RATE = 1.95583;
        
        let finalPriceEUR = priceEUR !== undefined ? parseFloat(priceEUR) : undefined;
        let finalPriceBGN = priceBGN !== undefined ? parseFloat(priceBGN) : undefined;
        
        // Fallback: if neither priceEUR nor priceBGN provided, use old price field and convert to both
        if (!priceEUR && !priceBGN && price) {
            const oldPrice = parseFloat(price);
            finalPriceBGN = oldPrice; // Old price is in BGN
            finalPriceEUR = oldPrice / CONVERSION_RATE;
        } else {
            // If EUR price is not provided, calculate from BGN
            if (!priceEUR && priceBGN) {
                finalPriceEUR = parseFloat(priceBGN) / CONVERSION_RATE;
            }
            
            // If BGN price is not provided, calculate from EUR
            if (!priceBGN && priceEUR) {
                finalPriceBGN = parseFloat(priceEUR) * CONVERSION_RATE;
            }
        }
        
        const service = new Service({
            name,
            description,
            duration: length,
            price: price, // Keep old price for backward compatibility
            priceEUR: finalPriceEUR,
            priceBGN: finalPriceBGN,
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
        const { name, description, length, priceEUR, priceBGN, price, sortOrder } = req.body;
        
        // Conversion rate: 1 EUR = 1.95583 BGN
        const CONVERSION_RATE = 1.95583;
        
        let finalPriceEUR = priceEUR !== undefined ? parseFloat(priceEUR) : undefined;
        let finalPriceBGN = priceBGN !== undefined ? parseFloat(priceBGN) : undefined;
        
        // If both prices are being updated or one is missing, handle conversion
        if (req.body.priceEUR !== undefined && req.body.priceBGN !== undefined) {
            // Both provided, use as-is
        } else if (priceEUR !== undefined && !priceBGN) {
            // Only EUR provided, calculate BGN
            finalPriceBGN = parseFloat(priceEUR) * CONVERSION_RATE;
        } else if (priceBGN !== undefined && !priceEUR) {
            // Only BGN provided, calculate EUR
            finalPriceEUR = parseFloat(priceBGN) / CONVERSION_RATE;
        }
        
        const updateData: ServiceUpdateData = { 
            name, 
            description, 
            duration: length,
            sortOrder: sortOrder !== undefined ? sortOrder : undefined
        };
        
        if (finalPriceEUR !== undefined) updateData.priceEUR = finalPriceEUR;
        if (finalPriceBGN !== undefined) updateData.priceBGN = finalPriceBGN;
        if (price !== undefined) updateData.price = parseFloat(price); // Keep old price for backward compatibility
        
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