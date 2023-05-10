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
            await t.testOrTimeout(insomnia.verifyEvent());
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

        werewolfs[0].reinitExpectedEvents();
        werewolfs[0].addExpectedEvent({
            event: "CHAT_ERROR",
            game_id: 1,
            data: {
                status: 403,
                message: "Game has not started"
            }
        });
        await t.testOrTimeout(werewolfs[0].verifyEvent());
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

        werewolfs[0].reinitExpectedEvents();
        werewolfs[0].addExpectedEvent({
            event: "CHAT_ERROR",
            game_id: 1,
            data: {
                status: 403,
                message: "Chat Village unavailable during the night"
            }
        });
        await t.testOrTimeout(werewolfs[0].verifyEvent());
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

        insomnia.reinitExpectedEvents();
        insomnia.addExpectedEvent({
            event: "CHAT_ERROR",
            game_id: 1,
            data: {
                status: 403,
                message: "Insomnia cannot send message into werewolfs chat"
            }
        });
        await t.testOrTimeout(insomnia.verifyEvent());
    });
};
