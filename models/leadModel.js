import mongoose from "mongoose";
import { LEAD_STATUS } from '../config/lead_status.js';

const LEAD_STATUS_VALUES = Object.values(LEAD_STATUS);

const leadSchema = new mongoose.Schema(
        {
        lead_id: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        lead_name: {
            type: String,
            required: true,
            trim: true,
        },
        lead_email: {
            type: String,
            unique: true,
            trim: true,
        },
        lead_phone: {
            type: String,
            unique: true,
            trim: true,
        },
        lead_address: {
            type: String,
            trim: true,
            default: "na"
        },
        lead_source: {
            type: String,
            trim: true,
            default: "na"
            
        },
        lead_status : {
            type: String,
            required: true,
            enum: LEAD_STATUS_VALUES,
            default: LEAD_STATUS.Approached,
        },
        lead_created: {
            type: String,
            trim: true,
            default: "na"
        }
        },
        
        { timestamps: true }
  );
  
  export const Lead = mongoose.model("lead", leadSchema);