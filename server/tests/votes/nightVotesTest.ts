import { VoteType } from "../../models/voteModel";
import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const testVoteNight = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    const werewolves: Array<Client> = players.filter((p) => p.getRole() === Role.WEREWOLF);
    const humans: Array<Client> = players.filter((p) => p.getRole() === Role.HUMAN);
    if (werewolves.length === 0) return;
    if (humans.length === 0) return;

    await test("Werewolves vote", async (t) => {
        werewolves[0].sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: humans[0].getName()
                }
            })
        );

        for (const werewolf of werewolves)
            await t.testOrTimeout(werewolf.verifyEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: humans[0].getName() } }));
    });

    await test("Vote type error", async (t) => {
        werewolves[1].sendMessage(
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
            werewolves[1].verifyEvent({
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
                    playerVoted: werewolves[1].getName()
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
        werewolves[0].sendMessage(
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
            werewolves[0].verifyEvent({
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
        for (const werewolf of werewolves) {
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

            for (const w of werewolves) {
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

        for (const werewolf of werewolves) {
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
        werewolves[1].sendMessage(
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
            werewolves[1].verifyEvent({
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
