import * as WebSocket from "ws";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import { Game } from "../models/gameModel";
import { Event } from "./eventController";

const { JWT_SECRET } = process.env;

export class WebsocketConnection {

    private static connections: Array<WebsocketConnection> = [];

    private ws: WebSocket;
    private user: User;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.user = null;
    }

    isAuthenticated(): boolean {
        return this.user != null;
    }

    public static onConnect = (ws: WebSocket): void => {
        // créer un connexion et le mettre dans une liste contenant toutes les connexions
        const connect: WebsocketConnection = new WebsocketConnection(ws);
        WebsocketConnection.connections.push(connect);
        ws.on("message", (message: string) => connect.readMessage(message));
    };

    async readMessage(message: string): Promise<void> {
        try {
            const data: { game_id?: number; event: string; data: Record<string, any> } = JSON.parse(message);

            if (!data || typeof data !== "object" || !data.event || !data.data || typeof data.data !== "object") {
                this.ws.send(JSON.stringify({ status: 400, message: "Bad Request" }));
                return;
            }
            if (data.event === "AUTHENTICATION") {
                const token: string = data.data.token;
                try {
                    if (!jwt.verify(token, JWT_SECRET)) {
                        this.ws.send(JSON.stringify({ status: 403, message: "Bad Authentication" }));
                        return;
                    }
                } catch (e) {
                    this.ws.send(JSON.stringify({ status: 403, message: "Bad Authentication" }));
                    return;
                }
                const username: string = (jwt.decode(token) as { username: string }).username;

                if (this.isAuthenticated()) {
                    if (this.user.getUsername() !== username) {
                        this.ws.send(JSON.stringify({ status: 403, message: "Bad Authentication" }));
                        return;
                    }
                    this.ws.send(JSON.stringify({ status: 200, message: "Already Authentified" }));
                    return;
                }

                this.user = User.getUser(username);
                this.user.setWebsocket(this.ws);
                // Envoie des sockettes en attentes
                this.user.sendWaitingSocket();
                this.ws.send(JSON.stringify({ status: 200, message: "User authenticated" }));
                return;
            }
            if (!this.isAuthenticated()) {
                this.ws.send(JSON.stringify({ status: 403, message: "Not Authenticated" }));
                return;
            }

            const game: Game = Game.getGame(data.game_id);
            if (!game) {
                this.ws.send(JSON.stringify({ status: 409, message: "Game doesn't exist" }));
                return;
            }
            if (!game.getPlayer(this.user.getUsername())) {
                this.ws.send(JSON.stringify({ status: 409, message: "User doesn't exist in this game" }));
                return;
            }

            if (!Event.getEventActions(data.event)) {
                this.ws.send(JSON.stringify({ status: 500, message: "Event doesn't exist" }));
                return;
            }
            // Exécute les méthodes relatives à un événement
            for (const func of Event.getEventActions(data.event)) func(game, this.user, data.data);
        } catch (e) {
            console.log(e);
            this.ws.send(JSON.stringify({ status: 500, message: "Server Internal Error" }));
        }
    }

}
