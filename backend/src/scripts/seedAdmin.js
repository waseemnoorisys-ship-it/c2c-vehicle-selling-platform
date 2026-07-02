require('dotenv').config({path:require('path').resolve(__dirname,'../../.env')});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/admin/adminUser.model');
async function seedAdmin(){
    await mongoose.connect(process.env.MONGO_URI)
    console.log('connected to DB')

    const existing = await AdminUser.findOne({email:process.env.ADMIN_EMAIL});
    if(existing){
        console.log('Admin user already exists');
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD,10);
    await AdminUser.create({
        firstName:'Super',
        lastName:'Admin',
        email:process.env.ADMIN_EMAIL,
        passwordHash,
        role:'superAdmin',
        isActive:true
    });
    console.log('Admin user created successfully');
    console.log('Admin email:',process.env.ADMIN_EMAIL);
    console.log('Admin Password:',process.env.ADMIN_PASSWORD);
    process.exit(1);
}
seedAdmin().catch((err)=>{
    console.error(err);
    process.exit(1);
})