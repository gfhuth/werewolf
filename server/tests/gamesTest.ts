import request from "supertest";
import { url, client0, client1, client2, client3, client4, client5, client6, client7, client8, client9 } from "./usersTest";

const testTiming = 2;
const date: Date = new Date();
date.setSeconds(date.getSeconds() + testTiming);

describe("Test games", () => {
    test("Create game", async () => {
        // On attend testTiming secondes pour que la partie créée commence
        let res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client0.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 4,
                    nbPlayerMax: 39,
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
        expect(res.status).toEqual(200);

        res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client4.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 2,
                    nbPlayerMax: 5,
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
        expect(res.status).toEqual(200);
    });

    test("Creation of a game with error", async () => {
        const res = await request(url)
            .post("/game/new")
            .set("content-type", "application/json")
            .set("x-access-token", client0.getToken())
            .send(
                JSON.stringify({
                    nbPlayerMin: 4,
                    nbPlayerMax: 39,
                    dayLength: 10 * 1000,
                    nightLength: 10 * 1000,
                    startDate: date.getTime(),
                    percentageWerewolf: 0.33,
                    probaContamination: -1,
                    probaInsomnie: 0.1,
                    probaVoyance: 0.1,
                    probaSpiritisme: 0.1
                })
            );
        expect(res.status).toEqual(406);
        expect(res.body).toEqual({ message: "Unvalid contamination probabilityShould be in [0,1]" });
    });

    test("Join game", async () => {
        // Ajout des joueurs dans la partie 1
        let res = await request(url).post("/game/1/join").set("x-access-token", client1.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: "Game successfully join" });

        res = await request(url).post("/game/1/join").set("x-access-token", client2.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/1/join").set("x-access-token", client3.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/1/join").set("x-access-token", client4.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/1/join").set("x-access-token", client5.getToken());
        expect(res.status).toEqual(200);

        // Ajout des joueurs dans la partie 2
        res = await request(url).post("/game/2/join").set("x-access-token", client5.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/2/join").set("x-access-token", client6.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/2/join").set("x-access-token", client7.getToken());
        expect(res.status).toEqual(200);

        res = await request(url).post("/game/2/join").set("x-access-token", client8.getToken());
        expect(res.status).toEqual(200);
    });

    test("Error when joining the game", async () => {
        let res = await request(url).post("/game/toto/join").set("x-access-token", client9.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "No game ID provided" });

        res = await request(url).post("/game/3/join").set("x-access-token", client9.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "Game doesn't exist" });

        res = await request(url).post("/game/1/join").set("x-access-token", client0.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "User is already in the game" });

        res = await request(url).post("/game/2/join").set("x-access-token", client9.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "Game full" });
    });

    test("Search game", async () => {
        const res = await request(url).get("/game/search").set("x-access-token", client2.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 6
                },
                {
                    id: 2,
                    startDate: date.getTime(),
                    host: client4.getName(),
                    nbPlayerMax: 5,
                    currentNumberOfPlayer: 5
                }
            ]
        });
    });

    test("Search game by id", async () => {
        const res = await request(url).get("/game/1/details").set("x-access-token", client8.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            id: 1,
            nbPlayerMax: 39,
            dayLength: 10 * 1000,
            nightLength: 10 * 1000,
            startDate: date.getTime(),
            percentageWerewolf: 0.33,
            probaContamination: 0.1,
            probaInsomnie: 0.1,
            probaVoyance: 0.1,
            probaSpiritisme: 0.1,
            host: client0.getName(),
            wereWolfCount: Math.floor(39 * 0.33)
        });
    });

    test("Search game that doesn't exist", async () => {
        const res = await request(url).get("/game/toto/details").set("x-access-token", client7.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "Invalid game ID provided" });
    });

    test("Display user's games", async () => {
        const res = await request(url).get("/game/me").set("x-access-token", client5.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            games: [
                {
                    id: 1,
                    startDate: date.getTime(),
                    host: client0.getName(),
                    nbPlayerMax: 39,
                    currentNumberOfPlayer: 6
                },
                {
                    id: 2,
                    startDate: date.getTime(),
                    host: client4.getName(),
                    nbPlayerMax: 5,
                    currentNumberOfPlayer: 5
                }
            ]
        });
    });

    test("Player with no game", async () => {
        const res = await request(url).get("/game/me").set("x-access-token", client9.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ games: [] });
    });

    test("Leave game", async () => {
        const res = await request(url).post("/game/2/leave").set("x-access-token", client8.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: "Player sucessfully remove from the game 2" });
    });

    test("Error leaving a game", async () => {
        let res = await request(url).post("/game/2/leave").set("x-access-token", client8.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "User haven't join this game" });

        res = await request(url).post("/game/toto/leave").set("x-access-token", client7.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "No game ID provided" });

        res = await request(url).post("/game/3/leave").set("x-access-token", client7.getToken());
        expect(res.status).toEqual(500);
        expect(res.body).toEqual({ message: "Game doesn't exist" });
    });

    test("Other players leaving a game", async () => {
        let res = await request(url).post("/game/2/leave").set("x-access-token", client7.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: "Player sucessfully remove from the game 2" });

        res = await request(url).post("/game/2/leave").set("x-access-token", client6.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: "Player sucessfully remove from the game 2" });

        res = await request(url).post("/game/2/leave").set("x-access-token", client5.getToken());
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: "Player sucessfully remove from the game 2" });
    });
});
