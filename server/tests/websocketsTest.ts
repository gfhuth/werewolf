import dotenv from "dotenv";
dotenv.config();

import * as WebSocket from "ws";
import { client1 } from "./usersTest";
import Logger from "../util/Logger";
import { ClientToServerEvents } from "../controllers/event/eventTypes";

const { PORT, HOST } = process.env;

const url = `ws://${HOST}:${PORT}`;

const LOGGER = new Logger("WEBSOCKETS_TEST");

export class ExpectedEvent {

    private static eventHandlers: {
        [key: string]: Array<Record<string, any>>;
    } = {};

    public static getEventActions(event: string): Array<Record<string, any>> {
        if (ExpectedEvent.eventHandlers[event]) return ExpectedEvent.eventHandlers[event];
        return null;
    }

    public static registerHandlers<T extends keyof ClientToServerEvents>(event: T, func: (data: ClientToServerEvents[T]) => void): void {
        if (ExpectedEvent.eventHandlers[event]) ExpectedEvent.eventHandlers[event].push(func);
        else ExpectedEvent.eventHandlers[event] = [func];
    }

}

export class Client {

    private name: string;
    private token: string;

    private ws: WebSocket.WebSocket;
    private messages: Array<string>;
    private messageResolver: (msg: Record<string, any>) => void | null;

    private event: ExpectedEvent;

    constructor(name: string) {
        this.name = name;
        this.token = "";

        this.messages = [];
        this.ws = null;
        this.messageResolver = null;

        this.event = new ExpectedEvent();
    }

    public getName(): string {
        return this.name;
    }

    public getToken(): string {
        return this.token;
    }

    public setToken(token: string): void {
        this.token = token;
    }

    public getWebSocket(): WebSocket.WebSocket {
        return this.ws;
    }

    public setWebsocketConnection(): void {
        if (!this.ws) this.ws = new WebSocket.WebSocket(url);
    }

    public closeSocket(): void {
        this.ws.close();
        this.ws = null;
    }

    public getNextMessage(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            if (this.messages.length > 0) return resolve(JSON.parse(this.messages.shift()));
            else this.messageResolver = resolve;
        });
    }

    public async getNextEvent(event: string): Promise<Record<string, any>> {
        let message: Record<string, any>;
        while ((message = await this.getNextMessage()).event !== event) LOGGER.log(JSON.stringify(message));
        return message;
    }

    public sendMessage(message: string): void {
        this.ws.send(message);
    }

    public connect(): Promise<void> {
        return new Promise((resolve) => {
            this.ws.on("open", () => {
                resolve();
            });
            this.ws.on("message", (msg) => {
                const data: string = msg as unknown as string;
                if (this.messageResolver) {
                    this.messageResolver(JSON.parse(data));
                    this.messageResolver = null;
                } else {
                    this.messages.push(data);
                }
            });
        });
    }

    public async authenticate(): Promise<boolean> {
        this.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: this.token }
            })
        );
        const res: Record<string, any> = await this.getNextEvent("AUTHENTICATION");
        LOGGER.log(JSON.stringify(res));
        return res.status === 200;
    }

}

// beforeAll(async () => {
//     client1.setWebsocketConnection();
//     await client1.connect();
// });

// afterAll(() => {
//     client1.closeSocket();
// });

describe("Test websockets", () => {
    test("Websocket connection", async () => {
        client1.setWebsocketConnection();
        await client1.connect();
    });
    test("Utilisateur non authentifié", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        const res: Record<string, any> = await client1.getNextEvent("AUTHENTICATION");
        expect(res.status).toEqual(403);
        expect(res.message).toEqual("Not Authenticated");
    });

    test("Mauvais format des données envoyées", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA"
            })
        );

        const res: Record<string, any> = await client1.getNextEvent("AUTHENTICATION");
        expect(res.status).toEqual(400);
        expect(res.message).toEqual("Bad Request");
    });

    test("Authentification d'un utilisateur", async () => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client1.getToken() }
            })
        );

        const res: Record<string, any> = await client1.getNextEvent("AUTHENTICATION");
        expect(res.status).toEqual(200);
        expect(res.message).toEqual("User authenticated");
    });

    test("Utilisateur déjà authentifié", async () => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client1.getToken() }
            })
        );

        const res: Record<string, any> = await client1.getNextEvent("AUTHENTICATION");
        expect(res.status).toEqual(200);
        expect(res.message).toEqual("Already Authentified");
    });

    test("Mauvaise authentification d'un utilisateur", async () => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB" }
            })
        );

        const res: Record<string, any> = await client1.getNextEvent("AUTHENTICATION");
        expect(res.status).toEqual(403);
        expect(res.message).toEqual("Bad Authentication");
    });
    test("Close socket", () => {
        client1.closeSocket();
    });
});
