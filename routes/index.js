var express = require("express");
var router = express.Router();
const Doctor = require("../models/doctors.model");
const User = require("../models/user.model");
const verifyToken = require("../middlewire/verification.middle");
const AppointmentSlot = require("../models/apporitmentslots.model");


// Create doctor API
router.post("/create-doctor", verifyToken, async (req, res) => {
  try {
      const { name, specialization, experience, contact, doctorImage } = req.body;

      // Check if the logged-in user exists
      const user = await User.findById(req.user.userId); // ✅ Fix: Use req.user.userId instead of decoded.userId
      if (!user) {
          return res.status(404).json({ msg: "User not found" });
      }

      // Create new doctor linked to this user
      const doctor = new Doctor({
          user: req.user.userId, // ✅ Fix: Use req.user.userId
          name,
          specialization,
          experience,
          contact,
          doctorImage
      });

      await doctor.save();

      // Construct response data
      let data = [{
          "doctorName": doctor.name,
          "doctorspecialization": doctor.specialization,
          "doctorexperience": doctor.experience,
          "doctorcontact": doctor.contact,
          "doctordoctorImage": doctor.doctorImage
      }];

      res.status(201).json({ msg: "Doctor created successfully", data });

  } catch (err) {
      console.error("Error:", err.message); // ✅ Log error for debugging
      res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

router.post("/edit-doctor", verifyToken, async (req, res) => {
  try {
      const { doctorId,name, specialization, experience, contact, doctorImage } = req.body;
      
      // Find doctor by ID
      let doctor = await Doctor.findById(doctorId);
      if (!doctor) {
          return res.status(404).json({ msg: "Doctor not found" });
      }

      // Check if the logged-in user is the owner of the doctor record
      // Update only provided fields
      doctor.name = name || doctor.name;
      doctor.specialization = specialization || doctor.specialization;
      doctor.experience = experience || doctor.experience;
      doctor.contact = contact || doctor.contact;
      doctorImage ? doctor.doctorImage = doctorImage : null; // Update doctorImage only if provided

      await doctor.save();
      let data = [{
        doctorId: doctor._id,
          updatedData: {
              doctorName: doctor.name,
              doctorspecialization: doctor.specialization,
              doctorexperience: doctor.experience,
              doctorcontact: doctor.contact,
              doctordoctorImage: doctor.doctorImage
          }
      }]
      res.status(200).json({
          msg: "Doctor updated successfully",
          data
      });

  } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
  }
});


router.get("/get-my-doctors", verifyToken, async (req, res) => {
  try {
      // Check if the logged-in user exists
      const user = await User.findById(req.user.userId);
      if (!user) {
          return res.status(404).json({ msg: "User not found" });
      }

      // Find doctors linked to this user
      const doctors = await Doctor.find({ user: req.user.userId });

      if (!doctors.length) {
          return res.status(404).json({ msg: "No doctors found for this user" });
      }
      let data = [{
        count: doctors.length,
        doctors: doctors.map(doctor => ({
            doctorId: doctor._id,
            doctorName: doctor.name,
            specialization: doctor.specialization,
            experience: doctor.experience,
            contact: doctor.contact,
            doctorImage: doctor.doctorImage
        }))
      }]
      res.status(200).json({
          msg: "Doctors retrieved successfully",
          data
          
      });

  } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
  }
});


router.post("/create-slot", verifyToken, async (req, res) => {
  try {
      const { date, slots,doctorId } = req.body;
      const user = await User.findById(req.user.userId); // ✅ Fix: Use req.user.userId instead of decoded.userId
      if (!user) {
          return res.status(404).json({ msg: "User not found" });
      }

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
          return res.status(404).json({ msg: "Doctor not found" });
      }

     
      // Check if an appointment slot for the same doctor & date already exists
      let existingSlot = await AppointmentSlot.findOne({ doctor: doctorId, date });
      if (existingSlot) {
          return res.status(400).json({ msg: "Appointment slots for this date already exist." });
      }

      // Create new appointment slot
      const appointmentSlot = new AppointmentSlot({
        userId:  req.user.userId,
        doctorId: doctorId,
          date,
          slots

      });

      await appointmentSlot.save();
      let data = [{appointmentSlot}]
      res.status(201).json({
          msg: "Appointment slot created successfully",
          data
      });

  } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
  }
});
module.exports = router;
