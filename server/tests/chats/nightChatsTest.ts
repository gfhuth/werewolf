import { Client, Role } from "../main.test";

export enum ChatType {
    CHAT_VILLAGE = "CHAT_VILLAGE",
    CHAT_WEREWOLF = "CHAT_WEREWOLF",
    CHAT_SPIRITISM = "CHAT_SPIRITISM",
}

export const testChatNight = (players: Array<Client>, insomnia: Client, spiritism: Client): void =>
    describe("Test night chats", () => {
        const werewolfs: Array<Client> = players.filter((p) => p.isAlive() && p.getRole() === Role.WEREWOLF);

        test("Werewolf chat", async () => {
            const now: number = Date.now();
            if (werewolfs.length === 0) return;

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
                await werewolf.verifyEvent();
            }
            if (insomnia) {
                insomnia.reinitExpectedEvents();
                insomnia.addExpectedEvent({
                    event: "CHAT_RECEIVED",
                    game_id: 1,
                    data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
                });
                await insomnia.verifyEvent();
            }
        });
    });
