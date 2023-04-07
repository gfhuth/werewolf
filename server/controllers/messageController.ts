import { Chat, createMessage } from "../models/messageModel";
import { Game } from "../models/gameModel";
import { connections } from "./websocketController";
import { User } from "../models/userModel";

export const newMessage = (game: Game, user: User, data: {date: Date, chat_id: Chat, content: string}): void => {
    const message: { game: number, chat: number; user: number; content: string, date: number } = {
        game: game.getGameId(),
        chat: data.chat_id,
        user: user.getUserId(),
        content: data.content,
        date: data.date.getTime()
    };
    // TODO: vérifier que le message est sans erreurs

    createMessage(message);

    for (const connection of connections) {
        connection.ws.send(JSON.stringify({
            event: "CHAT_RECEIVED",
            data: {
                author: user.getUsername(),
                date: data.date,
                chat_id: data.chat_id,
                content: data.content
            }
        }));
    }
};
