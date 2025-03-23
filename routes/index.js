var express = require("express");
var router = express.Router();
const Doctor = require("../models/doctors.model");
const User = require("../models/user.model");
const verifyToken = require("../middlewire/verification.middle");
const AppointmentSlot = require("../models/apporitmentslots.model");
let mongoose = require("mongoose");
const Patient = require('../models/patients.model'); // Make sure path is correct


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

router.get("/getall-doctors",  async (req, res) => {
  try {
      // Find all doctors from the database
      const doctors = await Doctor.find();

      if (doctors.length === 0) {
          return res.status(404).json({ msg: "No doctors found" });
      }

      // Map the doctor data to a cleaner format for the response
      const doctorData = doctors.map(doctor => ({
          doctorName: doctor.name,
          doctorspecialization: doctor.specialization,
          doctorexperience: doctor.experience,
          doctorcontact: doctor.contact,
          doctordoctorImage: doctor.doctorImage
      }));

      res.status(200).json({ msg: "Doctors retrieved successfully", data: doctorData });

  } catch (err) {
      console.error("Error:", err.message);
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

router.get("/get-all-doctors-byhospital/:hospital_id", async (req, res) => {
  try {
    const { hospital_id } = req.params;

    // Validate hospital_id
    if (!hospital_id || !mongoose.Types.ObjectId.isValid(hospital_id)) {
      return res.status(400).json({ msg: "Invalid or missing hospital_id" });
    }

    const user = await User.findById(hospital_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const doctors = await Doctor.find({ user: hospital_id });

    if (!doctors.length) {
      return res.status(404).json({ msg: "No doctors found for this user" });
    }

    const data = [{
      count: doctors.length,
      doctors: doctors.map(doctor => ({
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        contact: doctor.contact,
        doctorImage: doctor.doctorImage
      }))
    }];

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
router.get("/get-all-slots", verifyToken, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ msg: "Invalid or missing user ID" });
      }
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Find all appointment slots created by this user
      const slots = await AppointmentSlot.find({ userId })
        .populate('doctorId', 'name specialization') // Optional: enrich doctor info
        .sort({ date: 1, 'slots.startTime': 1 });     // Optional: sort by date/time
  
      res.status(200).json({
        msg: "Appointment slots retrieved successfully",
        total: slots.length,
        slots
      });
  
    } catch (err) {
      console.error("Error fetching slots:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  });
router.get("/get-all-slots/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
  
      // Validate doctorId
      if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ msg: "Invalid or missing doctorId" });
      }
  
      // Optional: check if doctor exists (optional validation)
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) {
        return res.status(404).json({ msg: "Doctor not found" });
      }
  
      // Get all slots for that doctor
      const slots = await AppointmentSlot.find({ doctorId })
        .populate('userId', 'name email') // Optionally populate hospital info
        .sort({ date: 1, 'slots.startTime': 1 });
  
      res.status(200).json({
        msg: "Slots retrieved successfully",
        total: slots.length,
        slots
      });
  
    } catch (err) {
      console.error("Error fetching slots:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  });
  

  
router.post('/patients/add', async (req, res) => {
    try {
      const { name, contactNumber, diagnosis, doctorId, hospitalId,slotId } = req.body;
  
      // Validate input
      if (!name || !contactNumber || !diagnosis || !doctorId || !hospitalId ||!slotId) {
        return res.status(400).json({ msg: "All fields are required" });
      }
  
      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ msg: "Invalid doctorId or hospitalId" });
      }
  
      const newPatient = new Patient({
        name,
        contactNumber,
        diagnosis,
        doctorId,
        hospitalId,
        slotId
      });
  
      await newPatient.save();
  
      res.status(201).json({
        msg: "Patient added successfully",
        patient: newPatient
      });
    } catch (error) {
      console.error("Error adding patient:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });

router.get('/patients/get-all', verifyToken, async (req, res) => {
    try {
      const userId = req?.user?.userId;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ msg: "Invalid or missing user ID" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "Hospital not found" });
      }
  
      let patients = await Patient.find({ hospitalId: userId })
        .populate('doctorId', 'name specialization')
        .sort({ createdAt: -1 });
  
      // Manually inject slot details
      for (let patient of patients) {
        if (patient.slotId) {
          const slotData = await AppointmentSlot.findOne(
            { 'slots._id': patient.slotId },
            { slots: { $elemMatch: { _id: patient.slotId } } }
          );
  
          if (slotData && slotData.slots.length > 0) {
            patient._doc.slotDetails = slotData.slots[0]; // inject custom field
          } else {
            patient._doc.slotDetails = null;
          }
        } else {
          patient._doc.slotDetails = null;
        }
      }
  
      res.status(200).json({
        msg: "Patients retrieved successfully",
        total: patients.length,
        patients
      });
  
    } catch (error) {
      console.error("Error fetching patients:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });


  router.get("/get-all-hospital", async (req, res) => {
    try {
      let HospitalData = await User.find(); // ✅ await is necessary
      res.status(200).json(HospitalData);   // ✅ send the actual array of data
    } catch (err) {
      console.error("Error fetching hospitals:", err.message);
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  });
  
  
module.exports = router;
