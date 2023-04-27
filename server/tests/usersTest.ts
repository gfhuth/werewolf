import dotenv from "dotenv";
dotenv.config();

import * as WebSocket from "ws";
import request from "supertest";
import jwt from "jsonwebtoken";
import Logger from "../util/Logger";

const { PORT, HOST } = process.env;

const url = `http://${HOST}:${PORT}`;

const LOGGER = new Logger("CLIENTS");

export class Client {

    private name: string;
    private token: string;

    private ws: WebSocket.WebSocket;
    private messages: Array<string>;
    private messageResolver: (msg: Record<string, any>) => void | null;

    private expectedEvents: Array<Record<string, any>>;

    constructor(name: string) {
        this.name = name;
        this.token = "";

        this.messages = [];
        this.ws = null;
        this.messageResolver = null;

        this.expectedEvents = [];
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

    public getExpectedEvent(): Array<Record<string, any>> {
        return this.expectedEvents;
    }

    public addExpectedEvent(expectedEvent: Record<string, any>): void {
        this.expectedEvents.push(expectedEvent);
    }

    public getWebSocket(): WebSocket.WebSocket {
        return this.ws;
    }

    public setWebsocketConnection(): void {
        this.ws = new WebSocket.WebSocket(`ws://${HOST}:${PORT}`);
    }

    public closeSocket(): void {
        this.ws.close();
        this.ws = null;
    }

    public getNextMessage(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            // if (this.messages.length > 0) LOGGER.log(this.messages[0]);
            if (this.messages.length > 0) return resolve(JSON.parse(this.messages.shift()));
            else this.messageResolver = resolve;
        });
    }

    public async getNextEvent(event: string): Promise<Record<string, any>> {
        let message: Record<string, any>;
        while ((message = await this.getNextMessage()).event !== event) {}
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

    public async authenticate(): Promise<void> {
        this.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: this.token }
            })
        );
        const res: Record<string, any> = await this.getNextMessage();
        // LOGGER.log(JSON.stringify(res));
        expect(res.status).toEqual(200);
    }

    public async verifyEvent(): Promise<void> {
        let message: Record<string, any>;
        message = await this.getNextMessage();
        while (!this.expectedEvents.map<string>((res) => res.event).includes(message.event)) {
            // console.log(message, this.expectedEvents);
            message = await this.getNextMessage();
        }

        expect(this.expectedEvents).toContainEqual(message);
    }

    public reinitExpectedEvents(): void {
        this.expectedEvents.length = 0;
    }

}

const client1 = new Client("pierreh");
const password1 = "AZERTY1234";

const client2 = new Client("jeant");
const password2 = "1234AZERTY";

describe("Test users", () => {
    test("Create user and test whoami", async () => {
        // Test de la création d'un utilisateur
        let res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: client1.getName(), password: password1 }));
        const token1 = res.body.token;
        const name1: string = (jwt.decode(token1) as { username: string }).username;
        expect(name1).toEqual(client1.getName());
        client1.setToken(token1);

        // Création d'un second utilisateur
        res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: client2.getName(), password: password2 }));
        const token2 = res.body.token;
        const name2: string = (jwt.decode(token2) as { username: string }).username;
        expect(name2).toEqual(client2.getName());
        client2.setToken(token2);

        // Test de l'authentification d'un utilisateur avec un token
        res = await request(url).get("/user/whoami").set("x-access-token", client1.getToken());
        expect(res.body.username).toEqual(client1.getName());
    });

    test("User login", async () => {
        // Test du login d'un utilisateur
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: client1.getName(), password: password1 }));
        const tokenTest: string = res.body.token;
        expect((jwt.decode(tokenTest) as { username: string }).username).toEqual(client1.getName());
    });

    test("Username already exists", async () => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: client1.getName(), password: password1 }))
            .expect(409);
        expect(res.text).toEqual("User already register");
    });

    test("Missing password in user creation", async () => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }))
            .expect(400);
        expect(res.text).toEqual("Missing password");
    });

    test("Missing username in user creation", async () => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: password1 }))
            .expect(400);
        expect(res.text).toEqual("Missing username");
    });

    test("Invalid username", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "pierre", password: password1 }))
            .expect(500);
        expect(res.text).toEqual("Invalid username or invalid password");
    });

    test("Invalid password", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: client1.getName(), password: "AZERT1234" }))
            .expect(500);
        expect(res.text).toEqual("Invalid username or invalid password");
    });

    test("Missing password in user authentication", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }))
            .expect(400);
        expect(res.text).toEqual("Missing password");
    });

    test("Missing username in user authentication", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: password1 }))
            .expect(400);
        expect(res.text).toEqual("Missing username");
    });

    test("Wrong token in authentication", async () => {
        // Échec de l'authentification d'un utilisateur avec un token
        const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB";
        await request(url).get("/user/whoami").set("x-access-token", wrongToken).expect(400);
    });
});

export { client1, client2 };
