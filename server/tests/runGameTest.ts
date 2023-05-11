import { Client } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";
import { testVoteNight, verifyVoteResult } from "./votes/nightVotesTest";
import { testPowers } from "./powers/powerTest";
import { test } from "./test-api/testAPI";
import { verifyContamination } from "./powers/contaminationTest";

export const testRunGame = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    // Première nuit
    await testChatNight(players);
    await testVoteNight(players, clientNotInGame);

    // Test des pouvoirs
    await testPowers(players, clientNotInGame);

    // Premier jour
    await test("Attente du jour", async (t) => {
        for (const player of players) await t.timeout(player.startPeriod("DAY_START", 1, t), 10000);
    });
    await verifyContamination(players);
    await verifyVoteResult();
};
