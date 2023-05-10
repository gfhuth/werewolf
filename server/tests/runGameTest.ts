import { Client, Power } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";
import { testVoteNight } from "./votes/nightVotesTest";
import { clairvoyancePower } from "./powers/clairvoyanceTest";
import { powersTest } from "./powers/powerTest";
import { contaminationTest } from "./powers/contaminationTest";
import { insomniaTest } from "./powers/insomniaTest";

export const testRunGame = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    const insomnia: Client | undefined = players.find((p) => p.getPower() === Power.INSOMNIA);
    const spiritism: Client | undefined = players.find((p) => p.getPower() === Power.SPIRITISM);
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
    const clairvoyance: Client | undefined = players.find((p) => p.getPower() === Power.CLAIRVOYANCE);

    await testChatNight(players, insomnia);
    await testVoteNight(players);
    await clairvoyancePower(clairvoyance, players);
    await powersTest(players, clairvoyance, contamination, clientNotInGame);
    await contaminationTest(contamination, players);
    await insomniaTest(insomnia, players);
};
