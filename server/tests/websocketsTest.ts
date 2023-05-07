import { Client } from "./main.test";

export const testWebsockets = (client0: Client, client1: Client, client2: Client, client3: Client, client4: Client, client5: Client, client8: Client): void =>
    describe("Test websockets", () => {
        test("Setup roles and powers", async () => {
            await client0.controlStartGame(1);
            await client1.controlStartGame(1);
            await client2.controlStartGame(1);
            await client3.controlStartGame(1);
            await client4.controlStartGame(1);
            await client5.controlStartGame(1);
        });

        test("Mauvais format des données envoyées", async () => {
            client1.sendMessage(
                JSON.stringify({
                    game_id: 1,
                    event: "CHAT_SENT",
                    data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuA"
                })
            );

            client1.reinitExpectedEvents();
            client1.addExpectedEvent({ event: "AUTHENTICATION", status: 400, message: "Bad Request" });
            await client1.verifyEvent();
        });

        test("Utilisateur déjà authentifié", async () => {
            client1.sendMessage(
                JSON.stringify({
                    event: "AUTHENTICATION",
                    data: { token: client1.getToken() }
                })
            );

            client1.reinitExpectedEvents();
            client1.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "Already Authentified" });
            await client1.verifyEvent();
        });

        test("Event where the game doesn't exist", async () => {
            client1.sendMessage(
                JSON.stringify({
                    game_id: 3,
                    event: "CHAT_SENT",
                    data: { chat_type: 1, message: "Salut" }
                })
            );

            client1.reinitExpectedEvents();
            client1.addExpectedEvent({ event: "GAME_VERIFICATION", status: 409, message: "Game doesn't exist" });
            await client1.verifyEvent();
        });

        test("Event from wrong player", async () => {
            client8.sendMessage(
                JSON.stringify({
                    game_id: 1,
                    event: "CHAT_SENT",
                    data: { chat_type: 1, message: "Salut" }
                })
            );

            client8.reinitExpectedEvents();
            client8.addExpectedEvent({ event: "PLAYER_VERIFICATION", status: 409, message: "User doesn't exist in this game" });
            await client8.verifyEvent();
        });

        test("Wrong event", async () => {
            client1.sendMessage(
                JSON.stringify({
                    game_id: 1,
                    event: "UNEXISTING_EVENT",
                    data: { message: "Simulation de données" }
                })
            );

            client1.reinitExpectedEvents();
            client1.addExpectedEvent({ event: "EVENT_VERIFICATION", status: 500, message: "Event doesn't exist" });
            await client1.verifyEvent();
        });
    });
