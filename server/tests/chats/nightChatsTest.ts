import { Client, Power, Role } from "../main.test";
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

        werewolfs.forEach((p) => {
            p.reinitExpectedEvents();
            p.addExpectedEvent({
                event: "CHAT_RECEIVED",
                game_id: 1,
                data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
            });
        });

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

        console.log("messages : ");
        werewolfs.forEach((p) => p.log());
        for (const werewolf of werewolfs) t.assert(await werewolf.verifyEvent());

        if (insomnia) {
            insomnia.reinitExpectedEvents();
            insomnia.addExpectedEvent({
                event: "CHAT_RECEIVED",
                game_id: 1,
                data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
            });
            t.assert(await insomnia.verifyEvent());
        }
    });
};
