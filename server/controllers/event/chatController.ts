import { Chat, Chat_type, Message } from "../../models/chatModel";
import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { User } from "../../models/userModel";
import database from "../../util/database";
import { Event } from "../eventController";

/**
 * Enregistre un nouveau message dans la base de données et envoie le message sur le chat
 * @param {Game} game Partie dans laquelle le message est envoyée
 * @param {User} user Auteur du message
 * @param  {Record<string, any>} data Données relatives au message
 * @returns {Promise<void>}
 */
const newMessage = async (game: Game, user: User, data: { date: number; chat_type: Chat_type; content: string }): Promise<void> => {
    const message: Message = {
        game: game.getGameId(),
        type: data.chat_type,
        user: user.getUserId(),
        content: data.content,
        date: data.date
    };
    // TODO: vérifier que le message est sans erreurs
    
    // On récupère le chat concerné
    const chat: Chat = game.getChat(data.chat_type);

    // On récupère le joueur qui envoie le message
    const player: Player = game.getPlayer(user.getUsername());
    
    if (data.date < game.getGameParam().startDate) {
        player.sendError("CHAT_ERROR", 403, "Game is not started");
        return;
    }
    if (game.getStatus().status % 2 === 0 && data.chat_type !== Chat_type.CHAT_VILLAGE) {
        player.sendError("CHAT_ERROR", 403, "Wrong chat type");
        return;
    }
    if (game.getStatus().status % 2 === 1 && data.chat_type !== Chat_type.CHAT_WEREWOLF && data.chat_type !== Chat_type.CHAT_SPIRITISM) {
        player.sendError("CHAT_ERROR", 403, "Wrong chat type");
        return;
    }

    await database.insertInto("messages").values(message).execute();

    // On envoie le message sur ce chat
    if (chat) {
        if (chat.getMembers().length === 0) {
            player.sendError("CHAT_ERROR", 403, "There is no member in the chat");
            return;
        }
        chat.addMessage(message);
    } else {
        player.sendError("CHAT_ERROR", 500, "Chat null");
        return;
    }
};

/**
 * Met à jour les membres du chat du chaman
 * @param {Game} game Partie dans laquelle le chat est à mettre à jour
 * @param {User} user Utilisateur qui a le pouvoir du spiritisme
 * @param {Require<string, any>} data Nom du joueur mort avec qui le chaman échange la nuit
 */
const updateChat = (game: Game, user: User, data: { dead_player: string }): void => {
    const chaman: Player = game.getPlayer(user.getUsername());
    if (chaman.getPower() != 2) {
        user.sendMessage({ status: 403, message: "User hasn't spiritism power" });
        return;
    }
    game.updateSpiritismChat(game.getPlayer(user.getUsername()), game.getPlayer(data.dead_player));
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
Event.registerHandlers("UPDATE_CHAT_SPIRITSM", updateChat);
