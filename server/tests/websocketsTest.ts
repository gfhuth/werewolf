import { client1 } from "./usersTest";

describe("Test websockets", () => {
    beforeAll(async () => {
        client1.setWebsocketConnection();
        await client1.connect();
    });

    afterAll(() => {
        client1.closeSocket();
    });

    test("Utilisateur non authentifié", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: { chat_type: 1, message: "Salut" }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 403, message: "Not Authenticated" });
        await client1.verifyEvent();
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

    test("Authentification d'un utilisateur", async () => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client1.getToken() }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
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

    test("Mauvaise authentification d'un utilisateur", async () => {
        client1.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB" }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "AUTHENTICATION", status: 403, message: "Bad Authentication" });
        await client1.verifyEvent();
    });
});
