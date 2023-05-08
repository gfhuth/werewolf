import { Client, Power } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";
import { testVoteNight } from "./votes/nightVotesTest";

export const testRunGame = async (players: Array<Client>): Promise<void> => {
    const insomnia: Client | undefined = players.find((p) => p.getPower() === Power.INSOMNIA);
    const spiritism: Client | undefined = players.find((p) => p.getPower() === Power.SPIRITISM);
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
    const clairvoyance: Client | undefined = players.find((p) => p.getPower() === Power.CLAIRVOYANCE);

    await testChatNight(players, insomnia);
    await testVoteNight(players);
};
