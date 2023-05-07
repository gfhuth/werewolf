import dotenv from "dotenv";
dotenv.config();
import * as WebSocket from "ws";

import { testUsers } from "./usersTest";
import { testGames } from "./gamesTest";
import { testWebsockets } from "./websocketsTest";
import { testRunGame } from "./runGameTest";

const { PORT, HOST } = process.env;
export const url = `http://${HOST}:${PORT}`;

export enum Role {
    HUMAN,
    WEREWOLF,
}

export enum Power {
    NO_POWER = "NO_POWER",
    CLAIRVOYANCE = "CLAIRVOYANCE",
    INSOMNIA = "INSOMNIA",
    CONTAMINATION = "CONTAMINATION",
    SPIRITISM = "SPIRITISM",
}

export class Client {

    private name: string;
    private token: string;

    private role: Role;
    private power: Power;

    private ws: WebSocket.WebSocket;
    private messages: Array<string>;
    private messageResolver: (msg: Record<string, any>) => void | null;

    private expectedEvents: Array<Record<string, any>>;

    constructor(name: string) {
        this.name = name;
        this.token = "";
        this.role = Role.HUMAN;
        this.power = Power.NO_POWER;

        this.messages = [];
        this.ws = null;
        this.messageResolver = null;

        this.expectedEvents = [];
    }

    public log(): { name: string; role: Role; power: Power; messages: Array<Record<string, any>> } {
        return { name: this.name, role: this.role, power: this.power, messages: this.messages.map<Record<string, any>>((msg) => JSON.parse(msg)) };
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
            // console.log(this.messages);
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
                const message: string = msg as unknown as string;
                if (this.messageResolver) {
                    this.messageResolver(JSON.parse(message));
                    this.messageResolver = null;
                } else {
                    this.messages.push(message);
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
        let message: Record<string, any> = await this.getNextMessage();
        while (!this.expectedEvents.map<string>((res) => res.event).includes(message.event)) {
            // console.log(message, this.expectedEvents);
            message = await this.getNextMessage();
        }

        expect(this.expectedEvents).toContainEqual(message);
    }

    public async controlStartGame(gameId: number): Promise<void> {
        let message: Record<string, any> = await this.getNextEvent("SET_ROLE");
        this.role = message.data.role;
        if ((message = await this.getNextMessage()).event === "SET_POWER") this.power = message.data.power;
        this.reinitExpectedEvents();
        this.addExpectedEvent({ event: "NIGHT_STARTS", game_id: gameId, data: {} });
        this.verifyEvent();
    }

    public reinitExpectedEvents(): void {
        this.expectedEvents.length = 0;
    }

}

const client0 = new Client("erics");
const client1 = new Client("pierreh");
const client2 = new Client("jeant");
const client3 = new Client("paulg");
const client4 = new Client("yvesa");
const client5 = new Client("margota");
const client6 = new Client("luciel");
const client7 = new Client("benoito");
const client8 = new Client("clementp");
const client9 = new Client("maried");

describe("Sequentially run tests", () => {
    testUsers(client0, client1, client2, client3, client4, client5, client6, client7, client8, client9);

    test("Open websockets", async () => {
        client0.setWebsocketConnection();
        await client0.connect();

        client1.setWebsocketConnection();
        await client1.connect();

        client2.setWebsocketConnection();
        await client2.connect();

        client3.setWebsocketConnection();
        await client3.connect();

        client4.setWebsocketConnection();
        await client4.connect();

        client5.setWebsocketConnection();
        await client5.connect();

        client6.setWebsocketConnection();
        await client6.connect();

        client7.setWebsocketConnection();
        await client7.connect();

        client8.setWebsocketConnection();
        await client8.connect();

        client9.setWebsocketConnection();
        await client9.connect();
    });

    test("Clients' authentification", async () => {
        client0.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client0.getToken() } }));
        client0.reinitExpectedEvents();
        client0.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client0.verifyEvent();

        client1.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client1.getToken() } }));
        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client1.verifyEvent();

        client2.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client2.getToken() } }));
        client2.reinitExpectedEvents();
        client2.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client2.verifyEvent();

        client3.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client3.getToken() } }));
        client3.reinitExpectedEvents();
        client3.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client3.verifyEvent();

        client4.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client4.getToken() } }));
        client4.reinitExpectedEvents();
        client4.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client4.verifyEvent();

        client5.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client5.getToken() } }));
        client5.reinitExpectedEvents();
        client5.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client5.verifyEvent();

        client6.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client6.getToken() } }));
        client6.reinitExpectedEvents();
        client6.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client6.verifyEvent();

        client7.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client7.getToken() } }));
        client7.reinitExpectedEvents();
        client7.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client7.verifyEvent();

        client8.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client8.getToken() } }));
        client8.reinitExpectedEvents();
        client8.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client8.verifyEvent();

        client9.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: client9.getToken() } }));
        client9.reinitExpectedEvents();
        client9.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client9.verifyEvent();
    });

    testGames(client0, client1, client2, client3, client4, client5, client6, client7, client8, client9);
    testWebsockets(client0, client1, client2, client3, client4, client5, client8);
    // testRunGame();

    test("Close websockets", () => {
        client0.closeSocket();
        client1.closeSocket();
        client2.closeSocket();
        client3.closeSocket();
        client4.closeSocket();
        client5.closeSocket();
        client6.closeSocket();
        client7.closeSocket();
        client8.closeSocket();
        client9.closeSocket();
    });
});
