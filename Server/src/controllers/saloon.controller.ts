import { Request, Response } from 'express';
import { Saloon } from '../models/Saloon';
import { uploadBarberImageToS3 } from '../utils/s3Upload';

export const getSaloons = async (req: Request, res: Response) => {
  try {
    const saloons = await Saloon.find();
    res.status(200).json(saloons);
  } catch (error) {
    console.error('Error fetching saloons:', error);
    res.status(500).json({ error: 'Failed to fetch saloons' });
  }
};

export const createSaloon = async (req: Request, res: Response) => {
  try {
    const { name, address, gmapsLink } = req.body;
    let image = undefined;
    if (req.file) {
      image = await uploadBarberImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    const saloon = new Saloon({ name, address, gmapsLink, image });
    await saloon.save();
    res.status(201).json(saloon);
  } catch (error) {
    console.error('Error creating saloon:', error);
    res.status(500).json({ error: 'Failed to create saloon' });
  }
};

export const updateSaloon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, gmapsLink } = req.body;
    let updateData: any = { name, address, gmapsLink };
    if (req.file) {
      updateData.image = await uploadBarberImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    const saloon = await Saloon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!saloon) {
      return res.status(404).json({ error: 'Saloon not found' });
    }
    res.status(200).json(saloon);
  } catch (error) {
    console.error('Error updating saloon:', error);
    res.status(500).json({ error: 'Failed to update saloon' });
  }
};

export const deleteSaloon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const saloon = await Saloon.findByIdAndDelete(id);
    if (!saloon) {
      return res.status(404).json({ error: 'Saloon not found' });
    }
    res.status(200).json({ message: 'Saloon deleted' });
  } catch (error) {
    console.error('Error deleting saloon:', error);
    res.status(500).json({ error: 'Failed to delete saloon' });
  }
}; 