import { VoteType } from "../../models/voteModel";
import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const testVoteNight = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    const werewolfs: Array<Client> = players.filter((p) => p.isAlive() && p.getRole() === Role.WEREWOLF);
    const humans: Array<Client> = players.filter((p) => p.isAlive() && p.getRole() === Role.HUMAN);
    if (werewolfs.length === 0) return;
    if (humans.length === 0) return;

    await test("Werewolfs vote", async (t) => {
        werewolfs[0].sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: humans[0].getName()
                }
            })
        );

        for (const werewolf of werewolfs)
            await t.testOrTimeout(werewolf.verifyEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: humans[0].getName() } }));
    });

    await test("Vote type error", async (t) => {
        werewolfs[1].sendMessage(
            JSON.stringify({
                event: "RESPONSE_RATIFICATION",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_VILLAGE,
                    playerVoted: humans[0].getName(),
                    ratification: true
                }
            })
        );

        await t.testOrTimeout(
            werewolfs[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: `Vote type is ${VoteType.VOTE_VILLAGE} but vote type ${VoteType.VOTE_WEREWOLF} is expected`
                }
            })
        );
    });

    await test("Wrong participant to the vote", async (t) => {
        humans[1].sendMessage(
            JSON.stringify({
                event: "VOTE_SENT",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: werewolfs[1].getName()
                }
            })
        );

        await t.testOrTimeout(
            humans[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "You're not a participant of this vote"
                }
            })
        );
    });

    await test("Player voted not in the game", async (t) => {
        werewolfs[0].sendMessage(
            JSON.stringify({
                event: "RESPONSE_RATIFICATION",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: clientNotInGame.getName(),
                    ratification: true
                }
            })
        );

        await t.testOrTimeout(
            werewolfs[0].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Target player is not in the game"
                }
            })
        );
    });

    await test("Ratification of the proposition", async (t) => {
        let nbValidation = 0;
        for (const werewolf of werewolfs) {
            werewolf.sendMessage(
                JSON.stringify({
                    event: "RESPONSE_RATIFICATION",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_WEREWOLF,
                        playerVoted: humans[0].getName(),
                        ratification: true
                    }
                })
            );
            nbValidation += 1;

            for (const w of werewolfs) {
                await t.testOrTimeout(
                    w.verifyEvent({
                        event: "UPDATE_PROPOSITION",
                        game_id: 1,
                        data: {
                            vote_type: VoteType.VOTE_WEREWOLF,
                            playerVoted: humans[0].getName(),
                            nbValidation: nbValidation,
                            nbInvalidation: 0
                        }
                    })
                );
            }
        }

        for (const werewolf of werewolfs) {
            await t.testOrTimeout(
                werewolf.verifyEvent({
                    event: "VOTE_VALID",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_WEREWOLF,
                        playerVoted: humans[0].getName()
                    }
                })
            );
        }
    });

    await test("Vote closed", async (t) => {
        werewolfs[1].sendMessage(
            JSON.stringify({
                event: "VOTE_SENT",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: humans[1].getName()
                }
            })
        );

        await t.testOrTimeout(
            werewolfs[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Vote is closed"
                }
            })
        );
    });
};
