import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { token1, token2 } from "./usersTest";

const { PORT, HOST } = process.env;

const url = `http://${HOST}:${PORT}`;

const testTiming = 1;

afterAll(async () => {
    // On attend 1 secondes pour que la partie créée commence
    await new Promise((resolve) => setTimeout(resolve, testTiming * 1000));
});

describe("Test games", () => {
    test("Create game", async () => {
        const date: Date = new Date();

        // On attend testTiming secondes pour que la partie créée commence
        date.setSeconds(date.getSeconds() + testTiming);
        const res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", token1)
            .send(
                JSON.stringify({
                    nbPlayerMin: 2,
                    nbPlayerMax: 20,
                    dayLength: 10 * 1000,
                    nightLength: 10 * 1000,
                    startDate: date.getTime(),
                    percentageWerewolf: 0.33,
                    probaContamination: 0.1,
                    probaInsomnie: 0.1,
                    probaVoyance: 0.1,
                    probaSpiritisme: 0.1
                })
            );
        console.log(res.text);
        expect(res.status).toEqual(200);
    });

    test("Join game", async () => {
        const res = await request(url).post("/game/1/join").set("x-access-token", token2);
        expect(res.status).toEqual(200);
    });
});
