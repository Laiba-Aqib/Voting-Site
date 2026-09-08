const mongoose = require("mongoose");
require("dotenv").config();
const dns = require("dns");


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongodbURL = process.env.MONGODB_URL;
//const mongodbURL = process.env.MONGODB_URL_LOCAL;
// mongoose.connect(mongodbURL);
mongoose.connect(mongodbURL)
    .then(() => {
        console.log("✅ MongoDB Atlas connected successfully");
    })
    .catch((err) => {
        console.log("❌ MongoDB connection failed:");
        console.log(err);
    });
const db = mongoose.connection;

// db.on("connected",()=>{
//     console.log("database was connected");
// })

// db.on("error",(err)=>{
// console.log(err);
// })

// db.on("disconnected",()=>{
//     console.log("database was disconnected");
// })

module.exports=db;