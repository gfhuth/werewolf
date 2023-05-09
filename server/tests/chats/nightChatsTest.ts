import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export enum ChatType {
    CHAT_VILLAGE = "CHAT_VILLAGE",
    CHAT_WEREWOLF = "CHAT_WEREWOLF",
    CHAT_SPIRITISM = "CHAT_SPIRITISM",
}

export const testChatNight = async (players: Array<Client>, insomnia: Client): Promise<void> => {
    const werewolfs: Array<Client> = players.filter((p) => p.isAlive() && p.getRole() === Role.WEREWOLF);
    if (werewolfs.length === 0) return;

    await test("Werewolfs chat", async (t) => {
        const now: number = Date.now();

        werewolfs[0].sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        for (const werewolf of werewolfs) {
            werewolf.reinitExpectedEvents();
            werewolf.addExpectedEvent({
                event: "CHAT_RECEIVED",
                game_id: 1,
                data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
            });
            await t.testOrTimeout(werewolf.verifyEvent());
        }

        if (insomnia) {
            insomnia.reinitExpectedEvents();
            insomnia.addExpectedEvent({
                event: "CHAT_RECEIVED",
                game_id: 1,
                data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
            });
            insomnia.log();
            await t.testOrTimeout(insomnia.verifyEvent());
        }
    });
};
