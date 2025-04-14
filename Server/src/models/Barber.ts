import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    calendarId: {
        type: String,
        required: false
    }
});

export const Barber = mongoose.model('Barber', barberSchema); 