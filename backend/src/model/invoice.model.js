

import mongoose from "mongoose";



const invoiceSchema = new mongoose.Schema({ 
    customerName:{
        type:String,
        required:true
    },
    invoiceNumber:{
        type:String,
        required:true
    },
    invoiceDate:{
        type:Date,
        required:true
    },
    items:{
         type:String,
         required:true
    },
    quantity:{
         type:Number,
         required:true
        },
        price:{
            type:Number,
            required:true
        },
        units:{
            type:String,
            enum:["sqft","dismil","khata","sqyrd","acre"],
            required:true
        },
        gst:{
            type:Number,
            required:true
        },
        discount:{
            type:Number,
            required:true
        },
        dueDate:{
            type:Date,
            required:true
        },  

    total:{
        type:Number,
        required:true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: function () {
            return this.total ?? 0;
        }
    },
    status: {
        type: String,
        enum: ["DUE", "PARTIAL", "PAID"],
        default: "DUE"
    },
    
},{timestamps:true})



const invoiceModel = mongoose.model('Invoice', invoiceSchema);

export default invoiceModel;
