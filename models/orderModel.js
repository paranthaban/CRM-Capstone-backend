import mongoose from "mongoose";
import {ORDER_STATUS} from '../config/order_Status.js'

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS)

const orderSchema = new mongoose.Schema(
    {
        orderID: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        order_items : [],
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
        order_status: {
            type: String,
            required: true,
            enum: ORDER_STATUS_VALUES,
        },
        order_qty:{
            type: Number,
            required: true,
        },
        order_amount:{
            type: Number,
            required: true,
        },
        order_date: {
            type: String,
            required: true,
            trim: true,
        },
        order_ETA: {
            type: String,
            required: true,
            trim: true,
        },
        order_delivered_on: {
            type: String,
            trim: true,
            default: "na"
        },
        order_items_rating : {
            type: Array,
            default: []
        },
      
    }
);

export const Order = mongoose.model("order", orderSchema);


