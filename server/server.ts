import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import gameRouter from "./routers/game";
import cors from "cors";
import * as http from "http";
import * as WebSocket from "ws";

import { login, whoAmI, register, reinitDatabase, debugUser } from "./controllers/userController";
import { newGame } from "./controllers/gameController";
import { newChat } from "./controllers/chatController";
import { listMessages, newMessage } from "./controllers/messageController";
import { onConnect } from "./controllers/websocketController";

const app = express();

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ noServer: true });

const { PORT, HOST } = process.env;

createSchema();

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

//START move this part in routers/chat.ts
app.post("/game/:gameid/chat/:id", newChat);
// END PART TO MOVE

//START move this part in routers/message.ts
app.post("/game/:gameid/chat/:id/message/new", newMessage);
app.get("/game/:gameid/chat/:chatid/message", listMessages);
// END PART TO MOVE

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
