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
    image: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    startHour: { 
        type: Number,
        required: true
    },
    endHour: { 
        type: Number,
        required: true
    },
    workingDays: { // array of days of the week
        type: [String],
        required: true
    },
    calendarId: {
        type: String,
        required: false
    }
});

export const Barber = mongoose.model('Barber', barberSchema); 