import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import { login, whoAmI, register, reinitDatabase, debugUser } from "./controllers/userController";
import gameRouter from "./routers/game";
import cors from "cors";
import { newGame } from "./controllers/gameController";

import * as http from "http";
import * as WebSocket from "ws";

const app = express();

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ noServer: true });

const { PORT, HOST } = process.env;

createSchema();
console.log("database created");

app.use(
    cors({
        origin: true
    })
);
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.post("/user/login", login);
app.get("/user/whoami", whoAmI);
app.post("/user/register", register);
app.post("/user/reinit", reinitDatabase);
app.get("/user/debug", debugUser);
// END PART TO MOVE

//START move this part in routers/game.ts
// app.get("/game/search", searchGame);
app.post("/game/new", newGame);
// END PART TO MOVE

wss.on("connection", (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on("message", (message: string) => {
        //log the received message and send it back to the client
        console.log("Received: %s", message);
        ws.send(`You sent -> ${message}`);
    });
    //send immediatly a feedback to the incoming connection
    ws.send("Hi there, I am a WebSocket server");
});

const server = app.listen(parseInt(PORT), HOST, () => {
    console.log(`The application is listening on port http://${HOST}:${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, s => {
        wss.emit("connection", s, request);
    });
});
