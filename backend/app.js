const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp());


app.get("/", (req,res)=>{
    res.send("Notes API is running");
});


app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Server is healthy"
    });
});


module.exports = app;