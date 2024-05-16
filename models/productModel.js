import mongoose from "mongoose";
import {PRODUCT_TYPE, PRODUCT_STATUS} from '../config/product_Types.js'

const PRODUCT_TYPE_VALUES = Object.values(PRODUCT_TYPE)
const PRODUCT_STATUS_VALUES = Object.values(PRODUCT_STATUS)

const productSchema = new mongoose.Schema(
    {
        product_ID: {
            type: String,
            required: true,
            trim: true,
        },
        product_name:{
            type: String,
            required: true,
            trim: true,
        },
        product_model:{
            type: String,
            required: true,
            trim: true,
        },
        product_type: {
            type: String,
            required: true,
            enum: PRODUCT_TYPE_VALUES,
            default: PRODUCT_TYPE.New_Product,
        },
        product_price:{
            type: Number,
            required: true,
        },
        product_stock:{
            type: Number,
            required: true,
            default: 5,
        },
        product_discount:{
            type: Number,
            required: true,
            default: 0,
        },
        product_desc:{
            type: String,
            required: true,
            trim: true,
        },
        product_pic:{
            type: String,
            required: true,
            trim: true,
            default: "na"
        },
        product_color:{
            type: String,
            required: true,
            trim: true,
        },
        product_warranty:{
            type: String,
            required: true,
            trim: true,
        },
        product_status:{
            type: String,
            required: true,
            trim: true,
            enum: PRODUCT_STATUS_VALUES,
            default: PRODUCT_STATUS.Available,
        },
        launched_yr: {
            type: String,
            required: true,
            trim: true,
        }
    }
);

export const Product = mongoose.model("product", productSchema);
