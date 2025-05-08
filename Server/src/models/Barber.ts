import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: false,
        unique: false,
        sparse: true
    },
    phone: {
        type: String,
        required: false,
        sparse: true
    },
    image: {
        type: String,
        required: false,
        sparse: true
    },
    role: {
        type: String,
        required: false
    },
    startHour: { 
        type: Number,
        required: false
    },
    endHour: { 
        type: Number,
        required: false
    },
    workingDays: { // array of days of the week
        type: [String],
        required: false
    },
    calendarId: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Create a compound index to prevent duplicate assignments for the same barber on the same date
barberSchema.index({ 'saloonAssignments.date': 1, 'saloonAssignments.saloon': 1 }, { unique: true });

export const Barber = mongoose.model('Barber', barberSchema); 