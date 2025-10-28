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
        required: false
    },
    priceEUR: {
        type: Number,
        required: false
    },
    priceBGN: {
        type: Number,
        required: false
    },
    sortOrder: {
        type: Number,
        default: 0
    }
});

// Add a compound index for sorting
serviceSchema.index({ sortOrder: 1, name: 1 });

export const Service = mongoose.model('Service', serviceSchema); 