import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { token } from "./usersTest";

const { PORT, HOST } = process.env;

const url = `http://${HOST}:${PORT}`;

describe("Test games", () => {
    test("Create game", async () => {
        const date: Date = new Date();
        // On attend testTiming secondes pour que la partie créée commence
        const testTiming = 1;
        date.setSeconds(date.getSeconds() + testTiming);
        const res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", token)
            .send(
                JSON.stringify({
                    nbPlayerMin: 5,
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

        // On attend 1 secondes pour que la partie créée commence
        await new Promise((resolve) => setTimeout(resolve, testTiming * 1000));
    }, 11000);
    // On a augmenté le timeout du test précédent
});
