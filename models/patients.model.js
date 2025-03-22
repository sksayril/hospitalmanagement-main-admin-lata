const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming hospital info is stored in the User model
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppointmentSlot', // Assuming hospital info is stored in the User model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
