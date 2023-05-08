import { Client } from "./main.test";
import { testChatNight } from "./chats/nightChatsTest";

export const testRunGame = (players: Array<Client>, clairvoyance: Client, contamination: Client, insomnia: Client, spiritism: Client): void =>
    describe("Run of a game", () => {
        testChatNight(players, insomnia, spiritism);
    });
