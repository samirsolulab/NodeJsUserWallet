import UserModel from '../models/User.js'
import TransModel from '../models/Transactiondetails.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailConfig.js'

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation,balance } = req.body
    const user = await UserModel.findOne({ email: email })
    if (user) {
      res.send({ "status": "failed", "message": "Email already exists" })
    } else {
      if (name && email && password && password_confirmation) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              balance:500,
              
            })
            await doc.save()
            // res.status(201).send({ "status": "success", "message": "Registration Success"})
            const saved_user = await UserModel.findOne({ email: email })
            if(saved_user){
            // Generate JWT Token
            const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '3d' })
            const link = `http://127.0.0.1:3000/api/user/login/${saved_user.email}/${password}`

               //send Registration Confirmation Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: saved_user.email,
          subject: "Successfull  SignUp",
          html: `<h2><a href=${link}>Click Here</a> to Login  </h2> <p> Congratulations!!! You Have Successfully Register And Got 500 Tokens<p> `
        })

            res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
      }
         

          } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Register" })
          }
        } else {
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
        }
      } else {
        res.send({ "status": "failed", "message": "All fields are required" })
      }
    }
  }

  //LogIn
  
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body
      if (email && password) {
        const user = await UserModel.findOne({ email: email })
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password)
          if ((user.email === email) && isMatch) {
            // Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '3d' })
            global.globalString = user.email;
            res.send({ "status": "success", "message": "Login Success", "token": token,"email":user.email })
          } else {
            res.send({ "status": "failed", "message": "Email or Password is not Valid" })
          }
        } else {
          res.send({ "status": "failed", "message": "You are not a Registered User" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unable to Login" })
    }
  }

  //change User Password
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
        res.send({ "status": "success", "message": "Password changed succesfully" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  }

  //To get Loged User Data
  static loggedUser = async (req, res) => {
    res.send({ "user": req.user })
  }

  //Send Reset Password Email
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body
    if (email) {
      const user = await UserModel.findOne({ email: email })
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
        console.log(link)
        // Send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "SAMSHOP - Password Reset Link",
          html: `<h2><a href=${link}>Click Here</a> to Reset Your Password </h2>`
        })
        res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
      } else {
        res.send({ "status": "failed", "message": "Email doesn't exists" })
      }
    } else {
      res.send({ "status": "failed", "message": "Email Field is Required" })
    }
  }

  //Reset Password
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body
    const { id, token } = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
      jwt.verify(token, new_secret)
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else {
          const salt = await bcrypt.genSalt(10)
          const newHashPassword = await bcrypt.hash(password, salt)
          await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
          res.send({ "status": "success", "message": "Password Reset Successfully" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Invalid Token" })
    }
  }

//   Update balance
  static transferToken = async (req, res) => {
    const { email, quantity } = req.body
    const currentUserEmail = globalString ;
    const reqID = req.params.id;
    const logedInUser = await UserModel.find({email:currentUserEmail})
  
    const [reciever] = await UserModel.find({email:email})
    const [sender] = await UserModel.find({email:currentUserEmail})
    // console.log( reciever, reciever._id);
    const updatedUser = await UserModel.findByIdAndUpdate(reciever._id, {balance:quantity+reciever.balance},{new : true})
    const updatedCurrentUser = await UserModel.findByIdAndUpdate(sender._id, {balance:sender.balance - quantity},{new : true})
try{
    const doc = new TransModel({
      sender_email: sender.email,
      reciever_email: reciever.email,
      sender_debit_token: quantity ,
      reciever_credit_token: quantity ,
      sender_balance:  updatedCurrentUser.balance ,
      reciever_balance: updatedUser.balance ,
      
    })
    await doc.save()

    let senderinfo = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: sender.email,
      subject: "Token Send",
      html: `<h2>Dear user, you transfer  ${quantity } tokens to ${ email } succesfully.</h2> <p>Your current tokens are ${updatedCurrentUser.balance} Thank You!! </p>`
          
    })
    //send Email to sender and reciever on successful transfer...
    let recieverinfo = await transporter.sendMail({
      from: process.env.EMAIL_TO,
      to: reciever.email,
      subject: "Token Recieved ",
      html: `<h2>Congrat's you got  ${quantity}  tokens from  ${currentUserEmail}  succesfully.</h2> <p>Your current tokens are ${updatedUser.balance} Thank You!! </p>`
      
    })
  }
    catch(error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unable to Send Token" })
    }
res.send({ "status": "success", "message": " Token send succesfully" })
}
  

}
  export default UserController
