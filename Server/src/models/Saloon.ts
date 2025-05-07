import mongoose from 'mongoose';

const saloonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  gmapsLink: {
    type: String,
    required: false
  }
});

export const Saloon = mongoose.model('Saloon', saloonSchema); 