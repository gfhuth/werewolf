import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql";

import { getToken } from "./controllers/user";
import gameRouter from "./routers/game";

const app = express();
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.get("/", (req, res) => {
    res.send("This is a test web page!");
});
app.post("/auth", getToken);
// END PART TO MOVE

app.listen(3000, () => {
    console.log("The application is listening on port https://localhost:3000");
});
