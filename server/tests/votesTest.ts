import { Vote_type } from "../models/voteModel";
import { Client } from "./websocketsTest";
import { token1, username1 } from "./usersTest";

let client1: Client;

beforeAll(async () => {
    client1 = new Client();
    await client1.connect();
});

afterAll(() => {
    client1.closeSocket();
});

describe("Test votes", () => {
    test("Authenticate client on websocket", async () => {
        const isAuthenticated: boolean = await client1.authenticate(token1);
        expect(isAuthenticated).toEqual(true);
    });
    test("Send message", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: Vote_type.VOTE_WEREWOLF,
                    vote: username1
                }
            })
        );
        const res1: Record<string, any> = await client1.getNextMessage();
        if (res1.event === "VOTE_RECEIVED") expect(res1.data.vote_type).toEqual(Vote_type.VOTE_WEREWOLF);
    });
});
