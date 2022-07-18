import mongoose from "mongoose";

// Defining Schema
const tranDetails = new mongoose.Schema({
  sender_email: { type: String, required: true, trim: true },
  reciever_email: { type: String, required: true, trim: true },
  sender_debit_token: { type: String, trim: true },
  reciever_credit_token: { type: String, trim: true },
  sender_balance: { type: String, trim: true },
  reciever_balance: { type: String, trim: true },  

})




// Model
const TransModel = mongoose.model("transaction", tranDetails)

export default TransModel