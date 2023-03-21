import dotenv from "dotenv";  
dotenv.config()
import express from "express";
import mysql from "mysql";

const app = express();

app.get("/", (req, res) => {
    res.send("This is a test web page!");
});

app.listen(3000, () => {
    console.log("The application is listening on port 3000!");
});



/**
 * 
//then use it 
const db = require('db')
db.connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS
})
 */