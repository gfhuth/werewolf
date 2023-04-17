import { Chat, Chat_type, Message } from "../../models/chatModel";
import { Game } from "../../models/gameModel";
import { User } from "../../models/userModel";
import database from "../../util/database";
import { Event } from "../eventController";

export const newMessage = (game: Game, user: User, data: { date: number; chat_type: Chat_type; content: string }): void => {
    const message: Message = {
        game: game.getGameId(),
        type: data.chat_type,
        player: user.getUserId(),
        content: data.content,
        date: data.date
    };
    // TODO: vérifier que le message est sans erreurs

    database.insertInto("messages").values(message).execute();

    // On récupère le chat concerné
    const chat: Chat = game
        .getChats()
        .reverse()
        .find((c) => c.getType() === message.type);

    // On envoie le message sur ce chat
    chat.addMessage(message, user);
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
console.log(Event.getEventActions("CHAT_SENT"));
