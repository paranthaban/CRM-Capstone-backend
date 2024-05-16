import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { transporter, verifyTransporter } from "../config/mailTransporter.js";
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
}); 

const client_URL = process.env.CLIENT_URL;

// register new user 
export const handleRegisterUser = async(req, res) => {

    try{
    const {new_User } = req.body;
    if(!new_User){
        res.status(400).send({message: "User Details not received"})
    }
    const found = await User.find({email: new_User.email}) 
    //console.log(found.length);
    if(!found.length){
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(new_User.password, salt); 
        const hashedUser = await { ...new_User, password: hashedPassword, isActivated:false };
        let addUser = new User({...hashedUser})
        const result= await addUser.save();
        //console.log(result);
        if(!result){
          return res.status(400)
              .json({message:"Error adding user"})
        }
        
        // create JWTs for account activation
        const validateToken = jwt.sign(
            {
                "userDetail": {
                    "email": result.email,
                    "role": result.role
                }
            },
            process.env.ACC_VALIDATION_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        verifyTransporter();
        const link = `${client_URL}/activate/${result._id}?activateToken=${validateToken}`;
        const mailOptions = {
          from: process.env.MAIL_ID,
          to: result.email,
          subject: 'Account Activation link sent',
          text: `Greetings from Clean Life ! Click on the below link to activate your account. This link is valid for 15 minutes after which link will be invalid. ${link}`
        };  
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log("Activation Email not sent",error);
              return res.status(201).send({ message:"Error sending activation email"}); 
            } else {
              console.log('Activation Email sent' + info.response); 
     //         return res.status(200).send({ result:result.acknowledged, message: "Activation link sent", data:hashedUser.email}); 
            }
          });

        res.status(201).json({message:"Acoount created"});
    }
    else {
        res.status(409).send({message: "Email already in use"})
    }
  }
  catch(error){
    res.status(500).send({message: "Internal server error", error: error})
  }
} 

//User Login
export const handleLogin = async(req,res) => {
  try{
    const { email, password } = req.body;
    //console.log(email);
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const foundUser = await User.findOne({email : email})
    //console.log(foundUser);
    if (!foundUser) return res.send(404).json({message: "User not found"}); //Not found 
    // check Activation 
    if( !foundUser.isActivated) return res.status(401).json({message: "User account not activated"}); //Unauthorized 
    // evaluate password 
    const validPwd = await bcrypt.compare(password, foundUser.password); 

    if (validPwd) {
        // create JWTs
        const accessToken = jwt.sign(
            {
                "userDetail": {
                    "email": foundUser.email,
                    "role": foundUser.role
                }
            },
            process.env.USER_ACCESS_TOKEN_SECRET,
            { expiresIn: '3h' }
        );
        const userdata = {
            username: foundUser.username,
            email : foundUser.email,
            role: foundUser.role,
            pic_URL : foundUser.pic_URL,
            pic_URL_ID : foundUser.pic_URL_ID,
            phone: foundUser.phone ? foundUser.phone : ""
        }
        res.status(200).json({ accessToken, userdata });
    }
    else {
        res.status(401).json({message : "Invalid Credentials"});
    }
}
catch(error){
    res.status(500).send({message: "Internal server error", error: error})
  }
}

// New user account activation
export const accountActivation = async(req,res) => {
    try{ 
        const {id,token} = req.params; 
        //console.log(id,token);
        if(!id || !token){
            return res.status(400).json({message:"Invalid link"})
        }
            const user = await User.findOne({_id : id})
            if(!user){
                return res.status(404).json({message:"User not found"})
            }
    
            if(!user.isActivated){
               console.log("checking activation token");
               const tokenCheck = jwt.verify(
                token,
                process.env.ACC_VALIDATION_TOKEN_SECRET,
                (err, decoded) => {
                    if (err) return {verified: false, error: err}; //invalid token
                    else return {verified: true, decoded }; 
                }
            );
               if( tokenCheck?.verified) {
                   if(tokenCheck.decoded.userDetail.email){
                       const result = await User.findByIdAndUpdate({_id: id},{isActivated: true},{new:true});

                       if(result)
                       return res.status(200).json({message:"Account activated successfully"})
                   }
               }
               else
               return res.status(401).json({message:"Token Error", error: tokenCheck.error})
            }
            else 
            return res.status(400).json({message:"Account already activated"})
     
    }
    catch(error){
        res.status(500).send({message: "Internal server error", error: error})
      }
} 

//Re-send Activation Email : 
export const resendActivation = async(req,res) => {
   try{
    const email = req.body.email;
    if(!email){
        return res.status(400).json({message:"Email required"})
    }
    const foundUser = await User.findOne({email : email})
    //console.log(foundUser); 
    if (!foundUser) return res.send(404).json({message: "User not found"}); 

    if(foundUser.isActivated) 
    return res.status(400).json({message: "User account already activated"}); 
    
    // create JWTs for account activation
    const validateToken = jwt.sign(
        {
            "userDetail": {
                "email": foundUser.email,
                "role": foundUser.role
            }
        },
        process.env.ACC_VALIDATION_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    verifyTransporter();
        const link = `${client_URL}/activate/${foundUser._id}?activateToken=${validateToken}`;
        const mailOptions = {
          from: process.env.MAIL_ID,
          to: foundUser.email,
          subject: 'Account Activation link sent',
          text: `Greetings from Clean Life ! Click on the below link to activate your account. This link is valid for 15 minutes after which link will be invalid. ${link}`
        };   

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log("Activation Email not sent",error);
              return res.status(400).send({ message:"Error sending activation email"}); 
            } 
            else {
              console.log('Activation Email sent' + info.response); 
             return res.status(200).send({ message: "Activation link sent"}); 
            }
          });
        }
        catch(error){
            res.status(500).send({message: "Internal server error", error: error})
        }
}

//Forgot Password - Send reset link mail 
export const forgotPassword = async(req,res) => {
    try{
        const email = req.body.email;
        if(!email){
            return res.status(400).json({message:"Email required"})
        }
        const foundUser = await User.findOne({email : email})
        //console.log(foundUser); 
        if (!foundUser) return res.send(404).json({message: "User not found"}); 
    
        if(!foundUser.isActivated) 
        return res.status(400).json({message: "User account not activated"}); 

        // create JWTs for password reset
       const temp = Math.random().toString(36).substring(2,11); 
       const result = await User.findByIdAndUpdate({_id : foundUser.id},{password: temp},{new:true});       
       if(result) {
        const secret = temp + process.env.RESET_PWD_TOKEN_SECRET
        const reset_Token = jwt.sign(
         {
             "userDetail": {
                 "email": foundUser.email,
                 "role": foundUser.role,
                 "id" : foundUser.id
             }
         },
         secret,
         { expiresIn: '15m' }
         );
 
         verifyTransporter();
         const link = `${client_URL}/forgotpwd/authorize/?id=${foundUser._id}&token=${reset_Token}`;
         const mailOptions = {
           from: process.env.MAIL_ID,
           to: foundUser.email,
           subject: 'Password Reset link sent',
           text: `Greetings from Clean Life ! Click on the below link to reset your password. 
           This link is valid for 15 minutes after which link will be invalid. ${link}`
         };   
 
         transporter.sendMail(mailOptions, function(error, info){
             if (error) {
               console.log("Reset link Email not sent",error);
               return res.status(400).send({ message:"Error sending reset link"}); 
             } 
             else {
               console.log('Reset link Email sent' + info.response); 
              return res.status(200).send({ message: "Password Reset link sent"}); 
             }
           });
       }       
    }
    catch(error){
        res.status(500).send({message: "Internal server error", error: error})
    }
}

// verifying and authorizing token to allow reset password
export const authorizePwdReset = async(req,res) => {
    try{
        const {id,token} = req.params; 
        console.log( "authorize reset link")

        if(!id || !token){
            return res.status(400).json({message:"Invalid link"})
        }
        const user = await User.findOne({_id : id})
            if(!user){
                return res.status(404).json({message:"User not found"})
            }
        const secret = user.password + process.env.RESET_PWD_TOKEN_SECRET ;
        const tokenCheck = jwt.verify(
            token,
            secret,
            (err, decoded) => {
                if (err) return {verified: false, error: err}; //invalid token
                else return {verified: true, decoded }; 
            }
        ); 
        if( tokenCheck?.verified) {
            res.status(200).json({id:id, token:token})
        }
        else
        return res.status(401).json({message:"Token Error", error: tokenCheck.error})
    }
    catch(error){
        res.status(500).send({message: "Internal server error", error: error})
    }
}

// Resetting password in DB
export const resetPassword = async(req,res) => {
    console.log("reset pwd")
    try{
        const {id,token} = req.params; 
        const password = req.body.password;
        console.log( "pwd reset link")

        if(!id || !token){
            return res.status(400).json({message:"Invalid link"})
        }
        const user = await User.findOne({_id : id})
            if(!user){
                return res.status(404).json({message:"User not found"})
            }
        const secret = user.password + process.env.RESET_PWD_TOKEN_SECRET ;
        const tokenCheck = jwt.verify(
            token,
            secret,
            (err, decoded) => {
                if (err) return {verified: false, error: err}; //invalid token
                else return {verified: true, decoded }; 
            }
        ); 
        if( tokenCheck?.verified) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const result = await User.findByIdAndUpdate(
                {_id : user.id},{password: hashedPassword},{new:true});  
            if(result)
            return res.status(200).json({message: "Password Reset Successfully"})
            else 
            return res.status(400).json({message: "error resetting password"})
        }
        else
        return res.status(401).json({message:"Token Error", error: tokenCheck.error})
    }
    catch(error){
        res.status(500).send({message: "Internal server error", error: error})
    }   
} 

// update Profile Pic 
export const updateProfilePic = async(req,res) => {
   try{
    console.log("profile pic")
         const {email, pic_URL, pic_URL_ID} = req.body;
           
         if(!email || !pic_URL || !pic_URL_ID)
         return res.status(400).json({message:"Invalid data"})

         const result = await User.findOneAndUpdate(
            {email: email},
            {pic_URL : pic_URL, pic_URL_ID: pic_URL_ID},
            {new:true}
         ) 
         //console.log(result)
         if(result){
            res.status(200).json({message: "Profile Pic updated"})
         }
   }
   catch(error){
    res.status(500).send({message: "Internal server error", error: error})
} 
} 

// update Phone  
export const updatePhone = async(req,res) => { 
    console.log("update phone")
    try{
     console.log("phone ")
          const {email, phone} = req.body;
            
          if(!email || !phone)
          return res.status(400).json({message:"Invalid data"})
 
          const result = await User.findOneAndUpdate(
             {email: email},
             {phone : phone},
             {new:true}
          ) 
          //console.log(result)
          if(result){           
             res.status(200).json({message: "Phone number updated"})
          }
    }
    catch(error){
     res.status(500).send({message: "Internal server error", error: error})
 } 
 }

//  Delete old pic from Cloudinary
export const deleteOldPic = async(req,res) => {
    console.log("cloudinary")
    const {public_id} = req.query
    //console.log( req.query, public_id);
    const imgID = public_id;
    try{
    const response = await cloudinary.uploader.destroy(imgID)
    console.log(response); 
    if(response.result === 'ok')
    res.status(200).send({respCloud: response.result}) 
    else 
    res.status(404).send({respCloud: response.result}) 
    }
    catch(err){
        res.status(500).send({respCloud: response.status, error: err}) 
    }
}