import { Vote_type } from "../models/voteModel";
import { Client } from "./websocketsTest";
import { token } from "./usersTest";

let client: Client;

beforeAll(async () => {
    client = new Client();
    await client.connect();
});

afterAll(() => {
    client.closeSocket();
});

describe("Test votes", () => {
    test("Authenticate client on websocket", async () => {
        const isAuthenticated: boolean = await client.authenticate(token);
        expect(isAuthenticated).toEqual(true);
    });
    test("Send message", async () => {
        client.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: Vote_type.VOTE_VILLAGE,
                    vote: "carrereb"
                }
            })
        );
        const res: Record<string, any> = await client.getNextEvent("VOTE_RECEIVED");
        expect(res.event).toEqual("VOTE_RECEIVED");
        expect(res.data.vote_type).toEqual(Vote_type.VOTE_VILLAGE);
    });
});
