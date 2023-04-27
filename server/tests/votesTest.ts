import { VoteType } from "../models/voteModel";
import { client1, client2 } from "./usersTest";

describe("Test votes", () => {
    beforeAll(async () => {
        client1.setWebsocketConnection();
        await client1.connect();
        await client1.authenticate();

        client2.setWebsocketConnection();
        await client2.connect();
        await client2.authenticate();
    });

    afterAll(() => {
        client1.closeSocket();
        client2.closeSocket();
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
});
