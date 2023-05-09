import dotenv from "dotenv";
dotenv.config();
import * as WebSocket from "ws";
import colors from "colors";
import { test, nbSuccess, nbFailed } from "./test-api/testAPI";

import { testUsers } from "./api/usersTest";
import { testGames } from "./api/gamesTest";
import { testWebsockets } from "./websocketsTest";
import { testRunGame } from "./runGameTest";

const { PORT, HOST } = process.env;
export const url = `http://${HOST}:${PORT}`;

export enum Role {
    HUMAN = "HUMAN",
    WEREWOLF = "WEREWOLF",
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
    private password: string;
    private token: string;

    private role: Role;
    private power: Power;

    private alive: boolean;

    private ws: WebSocket.WebSocket;
    private messages: Array<string>;
    private messageResolver: (msg: Record<string, any>) => void | null;

    private expectedEvents: Array<Record<string, any>>;

    constructor(name: string, password: string) {
        this.name = name;
        this.password = password;
        this.token = "";
        this.role = Role.HUMAN;
        this.power = Power.NO_POWER;
        this.alive = true;

        this.messages = [];
        this.ws = null;
        this.messageResolver = null;

        this.expectedEvents = [];
    }

    public log(): void {
        console.log({ name: this.name, role: this.role, power: this.power, expectedEvents: this.expectedEvents, messages: this.messages.map<Record<string, any>>((msg) => JSON.parse(msg)) });
    }

    public getName(): string {
        return this.name;
    }

    public getPassword(): string {
        return this.password;
    }

    public getToken(): string {
        return this.token;
    }

    public setToken(token: string): void {
        this.token = token;
    }

    public isAlive(): boolean {
        return this.alive;
    }

    public kill(): void {
        this.alive = false;
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

    public getRole(): Role {
        return this.role;
    }

    public getPower(): Power {
        return this.power;
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

    public async verifyEvent(): Promise<boolean> {
        let message: Record<string, any> = await this.getNextMessage();
        while (!this.expectedEvents.some((msg) => msg.event === message.event)) {
            // console.log(message);
            message = await this.getNextMessage();
        }

        const res: boolean = this.expectedEvents.some((msg) => JSON.stringify(msg) === JSON.stringify(message));
        if (!res) console.log(message);
        return res;
    }

    public async controlStartGame(gameId: number): Promise<boolean> {
        const message: Record<string, any> = await this.getNextEvent("GET_ALL_INFO_PLAYER");
        this.role = message.data.role;
        this.power = message.data.power;

        this.reinitExpectedEvents();
        this.addExpectedEvent({ event: "NIGHT_STARTS", game_id: gameId, data: {} });
        return await this.verifyEvent();
    }

    public reinitExpectedEvents(): void {
        this.expectedEvents.length = 0;
    }

}

const client0 = new Client("erics", "cjbdzqbczkl");
const client1 = new Client("pierreh", "cjbzceada");
const client2 = new Client("jeant", "ckldzcnùz");
const client3 = new Client("paulg", "bcziebcz");
const client4 = new Client("yvesa", "ncoacnaoĉ");
const client5 = new Client("margota", "cbuizciq");
const client6 = new Client("luciel", "copajvppa");
const client7 = new Client("benoito", "ccjzbbvi");
const client8 = new Client("clementp", "iabciiczc");
const client9 = new Client("maried", "nfzofbpv");

const allPlayers: Array<Client> = [client0, client1, client2, client3, client4, client5, client6, client7, client8, client9];
const main = async (): Promise<void> => {
    await testUsers(allPlayers);

    for (const player of allPlayers) {
        player.setWebsocketConnection();
        await player.connect();
    }

    await test("Clients' authentification", async (t) => {
        allPlayers.forEach(async (p) => {
            p.sendMessage(JSON.stringify({ event: "AUTHENTICATION", data: { token: p.getToken() } }));
            p.reinitExpectedEvents();
            p.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
            t.assert(await p.verifyEvent());
        });
    });

    await testGames(client0, client1, client2, client3, client4, client5, client6, client7, client8, client9);
    await testWebsockets(client0, client1, client2, client3, client4, client5, client8);
    await testRunGame([client0, client1, client2, client3, client4, client5], client8);

    allPlayers.forEach((p) => p.closeSocket());

    console.log();
    console.log(colors.yellow(`Total : ${nbSuccess + nbFailed}`));
    console.log(colors.green(`Succeed : ${nbSuccess}`));
    console.log(colors.red(`Failed : ${nbFailed}`));
};

main();
