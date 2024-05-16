import mongoose from "mongoose";
import { USER_ROLES } from "../config/user_Roles.js";

const USER_ROLES_VALUES = Object.values(USER_ROLES);

const userSchema = new mongoose.Schema(
        {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        pic_URL: {
            type: String,
            default: "na"
        },
        pic_URL_ID: {
            type: String,
            default: "na"
        },
        role: {
            type: String,
            required: true,
            enum: USER_ROLES_VALUES,
            default: USER_ROLES.Customer,
        },
        phone: {
            type: String
        },
        isActivated : {
            type: Boolean,
            required: true,
            default : false
        },
        acct_created: {
            type: Date,
            default: Date.now
        }
        },
        
        { timestamps: true }
  );
  
  export const User = mongoose.model("user", userSchema);