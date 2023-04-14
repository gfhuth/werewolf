import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import gameRouter from "./routers/game";
import cors from "cors";
import * as http from "http";
import * as WebSocket from "ws";

import { onConnect } from "./controllers/websocketController";
import userRouter from "./routers/user";
import { registerChatEvents } from "./controllers/messageController";

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
app.use("/user", userRouter);

registerChatEvents();

wss.on("connection", (ws: WebSocket) => {
    onConnect(ws);
});

const server = app.listen(parseInt(PORT), HOST, () => {
    console.log(`The application is listening on port http://${HOST}:${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (s) => {
        wss.emit("connection", s, request);
    });
});
