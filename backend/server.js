const express = require("express");
const body_parser= require("body-parser");
const cors = require("cors"); // Added CORS (Cross-Origin Resource Sharing): Browsers block frontend applications (running on http://localhost:3000 or 5173)
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors());
app.use(body_parser.json());

app.get('/',(req,res)=>{
    res.send("Voting App")
})

// importing routes
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//using routes
app.use('/user',userRoutes)
app.use('/candidate',candidateRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("server running successfully");
})