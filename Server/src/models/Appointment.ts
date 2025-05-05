import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  service: mongoose.Types.ObjectId;
  staff: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  dateTime: {
    date: string;
    time: string;
  };
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  staff: {
    id: { type: Schema.Types.ObjectId, ref: 'Barber', required: true },
    name: { type: String, required: true }
  },
  dateTime: {
    date: { type: String, required: true },
    time: { type: String, required: true }
  },
  customer: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema); 