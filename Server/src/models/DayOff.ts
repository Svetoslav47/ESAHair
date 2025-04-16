import mongoose from 'mongoose';

const dayOffSchema = new mongoose.Schema({
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: false
    }
});

// Create a compound index to prevent duplicate days off for the same barber
dayOffSchema.index({ barber: 1, date: 1 }, { unique: true });

export const DayOff = mongoose.model('DayOff', dayOffSchema); 