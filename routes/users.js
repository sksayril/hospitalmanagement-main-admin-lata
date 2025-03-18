var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


/* GET users listing. */
router.post("/signup", async (req, res) => {
  try {
      const { name, email, password,address,phone,imageUrl } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      // Save User (Plain text password)
      user = new User({ name, email, password,address,phone,imageUrl });
      await user.save();

      res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
      res.status(500).json({ msg: "Server Error" });
  }
});
router.post("/signin", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid credentials" });

      // Directly compare passwords (No hashing)
      if (password !== user.password) {
          return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Generate JWT Token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      data = [
        {
          "name": user.name,
          "email": user.email,
          "address": user.address,
          "phone": user.phone,
          "imageUrl": user.imageUrl,
          "token": token
        }
      ]
      res.json({ data });
  } catch (err) {
      res.status(500).json({ msg: "Server Error" });
  }
});
module.exports = router;
