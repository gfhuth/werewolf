import { client1, client8 } from "./usersTest";

const testTiming = 2;

describe("Test websockets", () => {
    beforeAll(async () => {
        client1.setWebsocketConnection();
        await client1.connect();

        client8.setWebsocketConnection();
        await client8.connect();
    });

    afterAll(() => {
        client1.closeSocket();
        client8.closeSocket();
    });

    test("Wait the game begin", async () => {
        // On attend testTiming secondes pour que la partie créée commence
        await new Promise((resolve) => setTimeout(resolve, testTiming * 1000));
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

        client8.sendMessage(
            JSON.stringify({
                event: "AUTHENTICATION",
                data: { token: client8.getToken() }
            })
        );
        client8.reinitExpectedEvents();
        client8.addExpectedEvent({ event: "AUTHENTICATION", status: 200, message: "User Authenticated" });
        await client8.verifyEvent();
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
