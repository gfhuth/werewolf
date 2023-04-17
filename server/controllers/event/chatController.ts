import { Chat, Chat_type, Message } from "../../models/chatModel";
import { Game } from "../../models/gameModel";
import { User } from "../../models/userModel";
import database from "../../util/database";
import { Event } from "../eventController";

const newMessage = async (game: Game, user: User, data: { date: number; chat_type: Chat_type; content: string }): Promise<void> => {
    const message: Message = {
        game: game.getGameId(),
        type: data.chat_type,
        user: user.getUserId(),
        content: data.content,
        date: data.date
    };
    // TODO: vérifier que le message est sans erreurs

    await database.insertInto("messages").values(message).execute();

    // On récupère le chat concerné
    const chat: Chat = game.getChat(data.chat_type);

    // On envoie le message sur ce chat
    if (chat) {
        if (chat.getMembers().length === 0) {
            user.getWebsocket().send(JSON.stringify({ status: 500, message: "There is no member in the chat" }));
            return;
        }
        chat.addMessage(message);
    } else {
        user.getWebsocket().send(JSON.stringify({ status: 500, message: "Chat null" }));
        return;
    }
};

const updateChat = (game: Game, user: User, data: { dead_player: string }): void => {
    game.updateSpiritismChat(game.getPlayer(user.getUsername()), game.getPlayer(data.dead_player));
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
Event.registerHandlers("UPDATE_CHAT_SPIRITSM", updateChat);
