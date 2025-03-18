const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    imageUrl:{type:String,required:true},
    password: { type: String, required: true },
}, { timestamps: true,strict:false });

module.exports = mongoose.model("User", UserSchema);
