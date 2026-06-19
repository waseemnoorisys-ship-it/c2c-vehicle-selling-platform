const mongoose = require("mongoose");
const vehicleMakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },//store  vehicle name like toyota , honda ,bmw etc.required true means it cannot be  empty and unique true means no duplicate value are allowed
    isActive: { type: Boolean, default: true },//isActive is a boolean field that is used to store the active status of the vehicle make. default true means it is active by default. that means if anyone wants to get GET /vehicle-makes which returns only active vehicle records then we can use this index to search vehicle by isActive field..
  },
  {
    timestamps: true,
  },
);
vehicleMakeSchema.index({name:1} ,{unique:true})//search by name and with ascending order..... but why unique again because they create a unique index on the name field.
vehicleMakeSchema.index({isActive:1})
//why this index on isActive becuase if anyone wants to get GET /vehicle-makes which returns only active vehicle records 
//  then we can use this index to search vehicle by isActive field..
module.exports = mongoose.model('vehicleMake', vehicleMakeSchema)