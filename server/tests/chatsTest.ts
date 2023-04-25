import { Chat_type } from "../models/chatModel";
import { Client } from "./websocketsTest";
import { token1, token2 } from "./usersTest";

let client1: Client;
let client2: Client;

beforeAll(async () => {
    client1 = new Client();
    await client1.connect();

    client2 = new Client();
    await client2.connect();
});

afterAll(() => {
    client1.closeSocket();
    client2.closeSocket();
});

describe("Test chats", () => {
    test("Authenticate client on websocket", async () => {
        let isAuthenticated: boolean = await client1.authenticate(token1);
        expect(isAuthenticated).toEqual(true);

        isAuthenticated = await client2.authenticate(token2);
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
                    chat_type: Chat_type.CHAT_WEREWOLF,
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
                    chat_type: Chat_type.CHAT_WEREWOLF,
                    content: "Premier message"
                }
            })
        );

        const res1: Record<string, any> = await client1.getNextMessage();
        const res2: Record<string, any> = await client2.getNextMessage();

        if (res1.event === "CHAT_RECEIVED") {
            expect(res1.data.chat_type).toEqual(Chat_type.CHAT_WEREWOLF);
            expect(res1.data.date).toEqual(now);
            expect(res1.data.content).toEqual("Premier message");
            expect(res2.event).toEqual("CHAT_ERROR");
            expect(res2.status).toEqual(403);
            expect(res2.message).toEqual("This player is not a member of this chat");
        } else {
            expect(res2.event).toEqual("CHAT_RECEIVED");
            expect(res2.data.chat_type).toEqual(Chat_type.CHAT_WEREWOLF);
            expect(res2.data.date).toEqual(now);
            expect(res2.data.content).toEqual("Premier message");
            expect(res1.event).toEqual("CHAT_ERROR");
            expect(res1.status).toEqual(403);
            expect(res1.message).toEqual("This player is not a member of this chat");
        }
    });
});
