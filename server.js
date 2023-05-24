const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const mongoose = require('mongoose');
require('dotenv').config()
const cors = require('cors');
// const cookieParser = require('cookie-parser');

const app = express();

// app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true}
));

async function connect(){
    try{
        await mongoose.connect(process.env.URI);
        console.log('Connected to mongoDB');

        process.on('SIGINT', async () => {
            try {
              await mongoose.connection.close();
              console.log('MongoDB connection closed');
              process.exit(0); // Exit the process
            } catch (error) {
              console.error('Error closing MongoDB connection:', error);
              process.exit(1); // Exit the process with an error
            }
        });
    }catch(error){
        console.log(error);
    }
}
connect();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
if(req.session.authorization) {
    token = req.session.authorization['accessToken'];
    jwt.verify(token, "access",(err,user)=>{
        if(!err){
            req.user = user;
            next();
        }
        else{
            return res.status(403).json({message: "User not authenticated"})
        }
     });
 } else {
     return res.status(403).json({message: "User not logged in"})
 }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
