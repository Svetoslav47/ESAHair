import mongoose from 'mongoose';

// services

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    duration: { // in minutes
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

export const Service = mongoose.model('Service', serviceSchema); 