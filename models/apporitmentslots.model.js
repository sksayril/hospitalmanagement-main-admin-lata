const mongoose = require("mongoose");

const AppointmentSlotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to doctor
    date: { type: String, required: true }, // Date format: YYYY-MM-DD
doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },    slots: [{
        startTime: { type: String, required: true }, // Time format: HH:mm
        endTime: { type: String, required: true } // Time format: HH:mm
    }]
}, { timestamps: true,strict:false });

module.exports = mongoose.model("AppointmentSlot", AppointmentSlotSchema);
