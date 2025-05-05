import { Request, Response } from 'express';
import Appointment, { IAppointment } from '../models/Appointment';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentData = {
      service: req.body.service,
      staff: req.body.staff,
      dateTime: req.body.dateTime,
      customer: req.body.details,
      status: 'pending'
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating appointment'
    });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate('service')
      .sort({ 'dateTime.date': 1, 'dateTime.time': 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching appointments'
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching appointment'
    });
  }
}; 