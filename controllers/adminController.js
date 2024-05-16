import { Product } from "../models/productModel.js";
import { nanoid } from 'nanoid' ;
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { transporter, verifyTransporter } from "../config/mailTransporter.js";
const client_URL = process.env.CLIENT_URL;

export const handleAddProduct = async(req, res) => {
    try{

        const {product} = req.body;
        const id = nanoid(7);
        const product_ID = product.product_type + "-" + id
        console.log("handle addprod") 
        const newProduct = new Product({...product, product_ID})
        const result = await newProduct.save();
        //console.log(result)
        if( result)
        res.status(200).json({message:"ok"});
        else
        res.status(400).json({message:"Error occured"});

    }
    catch(error){
        res.status(500).send({message: "Internal server error", error: error})
      }
}

export const handleAddEmployee = async(req, res) => {

console.log("adding new employee")
    try{ 
        //console.log(req.body)
        const {new_User } = req.body; 
        //console.log(new_User)
        if(!new_User){
            res.status(400).send({message: "Employee Details not received"})
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
                  .json({message:"Error adding employee"})
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
                { expiresIn: '15m' }
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