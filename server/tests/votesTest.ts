import { VoteType } from "../models/voteModel";
import { Client } from "./websocketsTest";
import { token1, token2, username1 } from "./usersTest";

let client1: Client;
let client2: Client;

beforeAll(async () => {
    client1 = new Client();
    await client1.connect();

    client2 = new Client();
    await client2.connect();
});

afterAll(() => {
    client1.closeSocket();
    client2.closeSocket();
});

describe("Test votes", () => {
    test("Authenticate client on websocket", async () => {
        let isAuthenticated: boolean = await client1.authenticate(token1);
        expect(isAuthenticated).toEqual(true);

        isAuthenticated = await client2.authenticate(token2);
        expect(isAuthenticated).toEqual(true);
    });

    test("Send vote", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    vote: username1
                }
            })
        );

        client2.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    vote: username1
                }
            })
        );

        const res1: Record<string, any> = await client1.getNextEvent("VOTE_RECEIVED");
        const res2: Record<string, any> = await client2.getNextEvent("VOTE_RECEIVED");

        if (res1.event === "VOTE_RECEIVED") {
            expect(res1.data.vote_type).toEqual(VoteType.VOTE_WEREWOLF);
            expect(res2.event).toEqual("VOTE_ERROR");
        } else {
            expect(res2.event).toEqual("VOTE_RECEIVED");
            expect(res1.data.vote_type).toEqual(VoteType.VOTE_WEREWOLF);
        }
    });
});
