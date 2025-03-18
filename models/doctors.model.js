const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to user
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    contact: { type: String, required: true },
    doctorImage: { type: String, required: true } // ✅ Ensure this field exists
}, { timestamps: true });

module.exports = mongoose.model("Doctor", DoctorSchema);
