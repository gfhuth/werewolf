import { Client } from "./main.test";
import { test } from "./test-api/testAPI";

export const testWebsockets = async (client0: Client, client1: Client, client2: Client, client3: Client, client4: Client, client5: Client, client8: Client): Promise<void> => {
    await test("Setup roles and powers", async (t) => {
        t.assert(await client0.controlStartGame(1));
        t.assert(await client1.controlStartGame(1));
        t.assert(await client2.controlStartGame(1));
        t.assert(await client3.controlStartGame(1));
        t.assert(await client4.controlStartGame(1));
        t.assert(await client5.controlStartGame(1));
    });

    await test("Mauvais format des données envoyées", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA"
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 400, message: "Bad Request" });
        t.assert(await client1.verifyEvent());
    });

    await test("Utilisateur déjà authentifié", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client1.getToken() }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "Already Authentified" });
        t.assert(await client1.verifyEvent());
    });

    await test("Event where the game doesn't exist", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 3,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "GAME_VERIFICATION", status: 409, message: "Game doesn't exist" });
        t.assert(await client1.verifyEvent());
    });

    await test("Event from wrong player", async (t) => {
        client8.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        client8.reinitExpectedEvents();
        client8.addExpectedEvent({ event: "PLAYER_VERIFICATION", status: 409, message: "User doesn't exist in this game" });
        t.assert(await client8.verifyEvent());
    });

    await test("Wrong event", async (t) => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "UNEXISTING_EVENT",
                data: { message: "Simulation de données" }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "EVENT_VERIFICATION", status: 500, message: "Event doesn't exist" });
        t.assert(await client1.verifyEvent());
    });
};
