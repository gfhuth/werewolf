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
                    playerVoted: client1.getName()
                }
            })
        );

        client2.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: client1.getName()
                }
            })
        );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: client1.getName() } });
        client1.addExpectedEvent({ event: "VOTE_VALID", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: client1.getName() } });
        client1.addExpectedEvent({ event: "VOTE_ERROR", game_id: 1, data: { status: 403, message: "Player voted doesn't participate to this vote" } });
        await client1.verifyEvent();

        client2.reinitExpectedEvents();
        client2.addExpectedEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: client1.getName() } });
        client2.addExpectedEvent({ event: "VOTE_ERROR", game_id: 1, data: { status: 403, message: "Player voted doesn't participate to this vote" } });
        client2.addExpectedEvent({ event: "VOTE_ERROR", game_id: 1, data: { status: 403, message: "Vote is closed" } });
        await client2.verifyEvent();
    });
});
