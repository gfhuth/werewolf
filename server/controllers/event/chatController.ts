import { Chat_type, Message, createMessage } from "../../models/chatModel";
import { Game } from "../../models/gameModel";
import { User } from "../../models/userModel";
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

    createMessage(message);

    // Ajout du message dans le chat et envoie à tous les autres joueurs concernés
    game.getPlayer(user.getUsername()).addMessage(message);
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
console.log(Event.getEventActions("CHAT_SENT"));
