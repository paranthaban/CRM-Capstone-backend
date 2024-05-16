import mongoose from "mongoose"; 
import {REQUEST_STATUS} from '../config/request_status.js'

const REQUEST_STATUS_VALUES = Object.values(REQUEST_STATUS) 

const requestSchema = new mongoose.Schema(
    { 
        requestID: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        orderID: {
            type: String,
            required: true,
            trim: true,
        },
        cust_address: {
            type: String,
            required: true,
            trim: true,
        },
        cust_email: {
            type: String,
            required: true,
            trim: true,
        },
        cust_phone: {
            type: String,
            required: true,
            trim: true,
        },
        request_date: {
            type: String,
            required: true,
            trim: true,
        },
        request_engg: {
            type: String,
            required: true,
            trim: true,
        },
        request_status: {
            type: String,
            required: true,
            enum: REQUEST_STATUS_VALUES,
        },
        request_summary: {
            type: Array,
            required: true,
        },
   
});
export const Request = mongoose.model("request", requestSchema);
