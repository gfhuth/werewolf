import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql";
import cookieParser from "cookie-parser";

import { getToken } from "./controllers/user";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("This is a test web page!");
});
app.post("/auth", getToken);

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
