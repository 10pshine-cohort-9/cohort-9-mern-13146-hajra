const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./src/logger/logger");


const errorMiddleware = require("./src/middleware/errorMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/", (req,res)=>{
    res.send("Notes API is running");
});


app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Server is healthy"
    });
});
app.get("/__test__/error", (req, res, next) => {
    next(new Error("Test application error"));
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(errorMiddleware);

module.exports = app;