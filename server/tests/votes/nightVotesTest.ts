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

        werewolfs
            .filter((p) => p !== werewolfs[0])
            .forEach(async (player): Promise<void> => {
                player.reinitExpectedEvents();
                player.addExpectedEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: humans[0].getName() } });
                t.assert(await player.verifyEvent());
            });
    });
};
