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
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        for (const werewolf of werewolfs) {
            await t.testOrTimeout(
                werewolf.verifyEvent({
                    event: "CHAT_RECEIVED",
                    game_id: 1,
                    data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
                })
            );
        }

        if (insomnia) {
            await t.testOrTimeout(
                insomnia.verifyEvent({
                    event: "CHAT_RECEIVED",
                    game_id: 1,
                    data: { author: werewolfs[0].getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "On vote pour qui ?" }
                })
            );
        }
    });

    await test("Wrong date on a message", async (t) => {
        const date: Date = new Date();
        date.setHours(date.getHours() - 1);

        werewolfs[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: date.getTime(),
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            werewolfs[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Game has not started"
                }
            })
        );
    });

    await test("Wrong chat", async (t) => {
        const now: number = Date.now();
        werewolfs[0].sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_VILLAGE,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            werewolfs[0].verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Chat Village unavailable during the night"
                }
            })
        );
    });

    await test("Insomnia send message", async (t) => {
        if (!insomnia) return;

        const now: number = Date.now();
        insomnia.sendMessage(
            JSON.stringify({
                event: "CHAT_SENT",
                game_id: 1,
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "On vote pour qui ?"
                }
            })
        );

        await t.testOrTimeout(
            insomnia.verifyEvent({
                event: "CHAT_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Insomnia cannot send message into werewolfs chat"
                }
            })
        );
    });
};
