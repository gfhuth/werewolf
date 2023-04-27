import { ChatType } from "../models/chatModel";
import { client1, client2 } from "./usersTest";

// beforeAll(async () => {
//     client1.setWebsocketConnection();
//     await client1.connect();

//     client2.setWebsocketConnection();
//     await client2.connect();
// });

// afterAll(() => {
//     client1.closeSocket();
//     client2.closeSocket();
// });

describe("Test chats", () => {
    test("Authenticate client on websocket", async () => {
        client1.setWebsocketConnection();
        await client1.connect();

        client2.setWebsocketConnection();
        await client2.connect();

        let isAuthenticated: boolean = await client1.authenticate();
        expect(isAuthenticated).toEqual(true);

        isAuthenticated = await client2.authenticate();
        expect(isAuthenticated).toEqual(true);
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

        client2.sendMessage(
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

        const res1: Record<string, any> = await client1.getNextEvent("CHAT_RECEIVED");
        const res2: Record<string, any> = await client2.getNextEvent("CHAT_RECEIVED");

        if (res1.event === "CHAT_RECEIVED") {
            expect(res1.data.chat_type).toEqual(ChatType.CHAT_WEREWOLF);
            expect(res1.data.date).toEqual(now);
            expect(res1.data.content).toEqual("Premier message");
            expect(res2.event).toEqual("CHAT_ERROR");
            expect(res2.status).toEqual(403);
            expect(res2.message).toEqual("This player is not a member of this chat");
        } else {
            expect(res2.event).toEqual("CHAT_RECEIVED");
            expect(res2.data.chat_type).toEqual(ChatType.CHAT_WEREWOLF);
            expect(res2.data.date).toEqual(now);
            expect(res2.data.content).toEqual("Premier message");
            expect(res1.event).toEqual("CHAT_ERROR");
            expect(res1.status).toEqual(403);
            expect(res1.message).toEqual("This player is not a member of this chat");
        }
    });
    test("Close socket", () => {
        client1.closeSocket();
        client2.closeSocket();
    });
});
