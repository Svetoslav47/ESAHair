import mongoose from 'mongoose';

const barberAssignmentSchema = new mongoose.Schema({
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    },
    saloon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Saloon',
        required: true
    },
    date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Create a compound index to ensure one assignment per barber per date
barberAssignmentSchema.index({ barber: 1, date: 1 }, { unique: true });

export const BarberAssignment = mongoose.model('BarberAssignment', barberAssignmentSchema); 