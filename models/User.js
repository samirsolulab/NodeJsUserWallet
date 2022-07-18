import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  balance: Number,
  
})

// const tranDetails = new mongoose.Schema({
//   senemail:{type: String, trim}
// })

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel