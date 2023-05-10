import { VoteType } from "../../models/voteModel";
import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const testVoteNight = async (players: Array<Client>): Promise<void> => {
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

        for (const werewolf of werewolfs) {
            werewolf.reinitExpectedEvents();
            werewolf.addExpectedEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: humans[0].getName() } });
            await t.testOrTimeout(werewolf.verifyEvent());
        }
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
                w.reinitExpectedEvents();
                w.addExpectedEvent({
                    event: "UPDATE_PROPOSITION",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_WEREWOLF,
                        playerVoted: humans[0].getName(),
                        nbValidation: nbValidation,
                        nbInvalidation: 0
                    }
                });
                await t.testOrTimeout(w.verifyEvent());
            }
        }

        for (const werewolf of werewolfs) {
            werewolf.reinitExpectedEvents();
            werewolf.addExpectedEvent({
                event: "VOTE_VALID",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: humans[0].getName()
                }
            });
            await t.testOrTimeout(werewolf.verifyEvent());
        }
    });
};
