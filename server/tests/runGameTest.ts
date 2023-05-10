import { Client } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";
import { testVoteNight } from "./votes/nightVotesTest";
import { testPowers } from "./powers/powerTest";

export const testRunGame = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    // Première nuit
    await testChatNight(players);
    await testVoteNight(players, clientNotInGame);

    // Test des pouvoirs
    await testPowers(players, clientNotInGame);

    // Premier jour
};
