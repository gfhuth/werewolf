import { Chat_type } from "../models/chatModel";
import { Client } from "./websocketsTest";
import { token } from "./usersTest";

let client: Client;

beforeAll(async () => {
    client = new Client();
    await client.connect();
});

afterAll(() => {
    client.closeSocket();
});

describe("Test chats", () => {
    test("Authenticate client on websocket", async () => {
        const isAuthenticated: boolean = await client.authenticate(token);
        expect(isAuthenticated).toEqual(true);
    });
    test("Send message", async () => {
        const now: number = Date.now();
        client.sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "CHAT_SENT",
                data: {
                    date: now,
                    chat_type: Chat_type.CHAT_VILLAGE,
                    content: "Premier message"
                }
            })
        );
        const res: Record<string, any> = await client.getNextMessage();
        console.log(res);
        expect(res.event).toEqual("CHAT_RECEIVED");
        expect(res.data.chat_type).toEqual(Chat_type.CHAT_VILLAGE);
        expect(res.data.date).toEqual(now);
        expect(res.data.content).toEqual("Premier message");
    });
});
