import { VoteType } from "../models/voteModel";
import { client1, client2 } from "./usersTest";

// beforeAll(async () => {
//     client1.setWebsocketConnection();
//     await client1.connect();

//     client2.setWebsocketConnection();
//     await client2.connect();
// });

// afterAll(() => {
//     client1.closeSocket();
//     client2.closeSocket();
// });

describe("Test votes", () => {
    test("Authenticate client on websocket", async () => {
        client1.setWebsocketConnection();
        await client1.connect();

        client2.setWebsocketConnection();
        await client2.connect();

        let isAuthenticated: boolean = await client1.authenticate();
        expect(isAuthenticated).toEqual(true);

        isAuthenticated = await client2.authenticate();
        expect(isAuthenticated).toEqual(true);
    });

    test("Send vote", async () => {
        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    vote: client1.getName()
                }
            })
        );

        client2.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    vote: client1.getName()
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
    test("Close socket", () => {
        client1.closeSocket();
        client2.closeSocket();
    });
});
