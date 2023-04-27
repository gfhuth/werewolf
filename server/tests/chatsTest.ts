import { ChatType } from "../models/chatModel";
import { client1, client2 } from "./usersTest";

describe("Test chats", () => {
    beforeAll(async () => {
        client1.setWebsocketConnection();
        await client1.connect();
        await client1.authenticate();

        // client2.setWebsocketConnection();
        // await client2.connect();
        // await client2.authenticate();
    });

    afterAll(() => {
        client1.closeSocket();
        // client2.closeSocket();
    });

    test("Send message", async () => {
        const now: number = Date.now();

        client1.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: {
                    date: now,
                    chat_type: ChatType.CHAT_WEREWOLF,
                    content: "Premier message"
                }
            })
        );

        // client2.sendMessage(
        //     JSON.stringify({
        //         game_id: 1,
        //         event: "CHAT_SENT",
        //         data: {
        //             date: now,
        //             chat_type: ChatType.CHAT_WEREWOLF,
        //             content: "Premier message"
        //         }
        //     })
        // );

        client1.reinitExpectedEvents();
        client1.addExpectedEvent({ event: "CHAT_RECEIVED", game_id: 1, data: { author: client1.getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "Premier message" } });
        client1.addExpectedEvent({ event: "CHAT_ERROR", game_id: 1, data: { status: 403, message: "This player is not a member of this chat" } });
        await client1.verifyEvent();

        // client2.reinitExpectedEvents();
        // client1.addExpectedEvent({ event: "CHAT_RECEIVED", game_id: 1, data: { author: client2.getName(), date: now, chat_type: ChatType.CHAT_WEREWOLF, content: "Premier message" } });
        // client1.addExpectedEvent({ event: "CHAT_ERROR", game_id: 1, data: { status: 403, message: "This player is not a member of this chat" } });
        // await client2.verifyEvent();
    });
});
