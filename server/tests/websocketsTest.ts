import dotenv from "dotenv";
dotenv.config();

import * as WebSocket from "ws";

const { PORT, HOST } = process.env;

const url = `ws://${HOST}:${PORT}`;

class Client {

    private ws: WebSocket.WebSocket;
    private messages: Array<string>;
    private messageResolver: (msg: Record<string, any>) => void | null;

    constructor() {
        this.messages = [];
        this.ws = new WebSocket.WebSocket(url);
        this.messageResolver = null;
    }

    public getWebSocket(): WebSocket.WebSocket {
        return this.ws;
    }

    public getNextMessage(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            if (this.messages.length > 0) return resolve(JSON.parse(this.messages.shift()));
            else this.messageResolver = resolve;
        });
    }

    public async getNextEvent(event: string): Promise<Record<string, any>> {
        let message: Record<string, any>;
        while ((message = await this.getNextMessage()).event !== event) {}
        return message;
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

    public closeSocket(): void {
        this.ws.close();
    }

}

let client: Client;

beforeAll(async () => {
    client = new Client();
    await client.connect();
});

afterAll(() => {
    client.closeSocket();
});

describe("Test websockets", () => {
    test("Utilisateur non authentifié", async () => {
        client.getWebSocket().send(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        const res: Record<string, any> = await client.getNextMessage();
        expect(res.status).toEqual(403);
        expect(res.message).toEqual("Not Authenticated");
    });

    test("Mauvais format des données envoyées", async () => {
        client.getWebSocket().send(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA"
            })
        );

        const res: Record<string, any> = await client.getNextMessage();
        expect(res.status).toEqual(400);
        expect(res.message).toEqual("Bad Request");
    });

    test("Authentification d'un utilisateur", async () => {
        client.getWebSocket().send(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA" }
            })
        );

        const res: Record<string, any> = await client.getNextMessage();
        expect(res.status).toEqual(200);
        expect(res.message).toEqual("User authenticated");
    });

    test("Utilisateur déjà authentifié", async () => {
        client.getWebSocket().send(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA" }
            })
        );

        const res: Record<string, any> = await client.getNextMessage();
        expect(res.status).toEqual(200);
        expect(res.message).toEqual("Already Authentified");
    });

    test("Mauvaise authentification d'un utilisateur", async () => {
        client.getWebSocket().send(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB" }
            })
        );

        const res: Record<string, any> = await client.getNextMessage();
        expect(res.status).toEqual(403);
        expect(res.message).toEqual("Bad Authentication");
    });
});
