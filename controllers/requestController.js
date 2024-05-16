import { Product } from "../models/productModel.js"; 
import { REQUEST_STATUS } from "../config/request_status.js"; 
import { Request } from "../models/requestModel.js"; 
import { nanoid } from "nanoid";
import { ORDER_STATUS } from "../config/order_Status.js"; 
import { transporter, verifyTransporter } from "../config/mailTransporter.js";


export const createRequest = async(req,res) => {
  try{   

    if(!req.body.orderID)
     return res.status(401).json({message : "Invalid Data"});
        try{
         console.log("new request")
         const id = nanoid(12)
         const requestID = 'SR-'+id 
         const createRequest = new Request({ ...req.body, requestID : requestID}) 
         await createRequest.save()
         console.log("NEW request placed data saved");

         //  send mail to customer 
         verifyTransporter();
        
         const mailOptions = {
           from: process.env.MAIL_ID,
           to: req.body.cust_email,
           subject: `Your service request is placed. request ID : ${requestID}`,
           text: `Greetings from Clean Life ! 
           Your service request has been placed: Your request ID : ${requestID}
           Our Engineer will contact you soon`
         };
 
         transporter.sendMail(mailOptions, function(error, info){
             if (error) {
               console.log(" Email not sent",error);
               return res.status(201).send({ message:"Error email"}); 
             } else {
               console.log(' Email sent' + info.response); 
      //         return res.status(200).send({ result:result.acknowledged, message: "Activation link sent", data:hashedUser.email}); 
             }
           });
 

            return res.status(200).json({"message": "request placed", 
            request: { ...req.body, requestID : requestID} });
        }
        catch( error ) {
            console.log('Error adding  data', error.message);
            return res.status(400).json({message:"Request not placed"});
        }
  }
  catch(error){
    console.log(error)
      res.status(500).send({message: "Internal server error", error: error})
    }
}

// get all requests of a customer or engineer ? 
export const getRequests = async(req,res) => {
    console.log("get request")
  try{
    if(! req.body)
       return res.status(401).json({message : "Invalid Data"});

       const requestHist = await Request.find(req.body).sort({request_date: -1})
       if(requestHist.length > 0) {
        return res.status(200).json({ requestsList : requestHist});
       }
       else {
        return res.status(404).json({message : "No requests found"});
       }

  }
  catch(error){
    console.log(error)
      res.status(500).send({message: "Internal server error", error: error})
    }
}

// get all requests of a Admin
export const getAllRequests = async(req,res) => {
  console.log("get all req monthly yearly")
try{
    const d = new Date();
    let year = d.getFullYear()
    let month = d.getMonth()+1
    const pattern1  = "^" +  String(year) + 
                      ( month<10 ? '0'+String(month) : String(month)) + ".*"
     const requestMonthly = await Request.find({request_date : { $regex : pattern1 }}).sort({request_date: -1})
     
     const pattern2  = "^" +  String(year) + ".*"
     const requestYearly = await Request.find({request_date : { $regex : pattern2 }}).sort({order_date: -1})

     if(requestMonthly.length > 0 || requestYearly.length > 0) {
      return res.status(200).json({ requestMonthly, requestYearly });
     }
     else {
      return res.status(404).json({message : "No requests found"});
     }

}
catch(error){
  console.log(error)
    res.status(500).send({message: "Internal server error", error: error})
  }
}


//  update request status by engg
export const updateRequest = async(req,res) => {
    console.log("update status req")
    try{   
        if(! req.body || ! req.body.requestID )
       return res.status(401).json({message : "Invalid Data"}); 
        
       const result = await Request.findOneAndUpdate({requestID: req.body.requestID},
                    {request_status: req.body.request_status, request_engg: req.body.request_engg }, {new:true}) 
        //console.log(result)
        if(result)
        return res.status(200).json({result});
        else {
            return res.status(404).json({message : "No requests found"});
           }

    }
    catch(error){
      console.log(error)
        res.status(500).send({message: "Internal server error", error: error})
      }
  }

  //  update request summary by engg
export const updateSummary = async(req,res) => {
    console.log("update status req")
    try{   
        if(! req.body || ! req.body.requestID )
       return res.status(401).json({message : "Invalid Data"}); 
        
       const result = await Request.findOneAndUpdate({requestID: req.body.requestID},
                    {request_summary: req.body.request_summary, request_engg: req.body.request_engg }, {new:true}) 
        //console.log(result)
        if(result)
        return res.status(200).json({result});
        else {
            return res.status(404).json({message : "No requests found"});
           }

    }
    catch(error){
      console.log(error)
        res.status(500).send({message: "Internal server error", error: error})
      }
  }