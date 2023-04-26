import { Chat, ChatType, Message } from "../../models/chatModel";
import { Game, GameStatus } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import SpiritismPower from "../../models/powers/SpiritismPower";
import database from "../../util/database";
import { Event } from "../eventController";
import Logger from "../../util/Logger";
import { ClientToServerEvents } from "./eventTypes";

const LOGGER = new Logger("WEBSOCKET");

/**
 * Enregistre un nouveau message dans la base de données et envoie le message sur le chat
 * @param {Game} game Partie dans laquelle le message est envoyée
 * @param {Player} player Auteur du message
 * @param  {Record<string, any>} data Données relatives au message
 * @returns {Promise<void>}
 */
const newMessage = async (game: Game, player: Player, data: { date: number; chat_type: ChatType; content: string }): Promise<void> => {
    const message: Message = {
        game: game.getGameId(),
        type: data.chat_type,
        user: player.getUser().getUsername(),
        content: data.content,
        date: data.date
    };
    // TODO: vérifier que le message est sans erreurs


    LOGGER.log(`New message`);
    // On récupère le chat concerné
    const chat: Chat = game.getChat(data.chat_type);

    if (data.date < game.getGameParam().startDate) {
        player.sendError("CHAT_ERROR", 403, "Game is not started");
        return;
    }
    if (data.chat_type !== ChatType.CHAT_VILLAGE && game.getStatus() !== GameStatus.DAY) {
        player.sendError("CHAT_ERROR", 403, "Chat Viallage unavailable during the night");
        return;
    }
    if (data.chat_type !== ChatType.CHAT_WEREWOLF && game.getStatus() !== GameStatus.NIGHT) {
        player.sendError("CHAT_ERROR", 403, "Chat Werewolf unavailable during the day");
        return;
    }
    if (data.chat_type !== ChatType.CHAT_SPIRITISM && game.getStatus() !== GameStatus.NIGHT) {
        player.sendError("CHAT_ERROR", 403, "Chat Spiritism unavailable during the day");
        return;
    }

    await database.insertInto("messages").values(message).execute();

    // On envoie le message sur ce chat
    if (chat) {
        if (chat.getMembers().length === 0) {
            player.sendError("CHAT_ERROR", 403, "There is no member in the chat");
            return;
        }
        if (!chat.getMembers().includes(player)) {
            player.sendError("CHAT_ERROR", 403, "This player is not a member of this chat");
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
 * @param {Player} player Utilisateur qui a le pouvoir du spiritisme
 * @param {Require<string, any>} data Nom du joueur mort avec qui le chaman échange la nuit
 */
const updateChat = (game: Game, player: Player, data: ClientToServerEvents["USE_POWER_SPIRITISM"]): void => {
    const chaman: Player = game.getPlayer(player.getUser().getUsername());
    if (chaman.getPower() instanceof SpiritismPower) {
        chaman.sendError("CHAT_ERROR", 403, "User hasn't spiritism power");
        return;
    }
    game.updateSpiritismChat(chaman, game.getPlayer(data.target));
};

const getAllChats = async (game: Game, player: Player): Promise<void> => {
    let res: { [key in ChatType]: Array<Message> };
    LOGGER.log(`CHAT ALL CHAT START`);
    res[ChatType.CHAT_VILLAGE] = game.getChat(ChatType.CHAT_VILLAGE).getMessages();
    res[ChatType.CHAT_WEREWOLF] = game.getChat(ChatType.CHAT_WEREWOLF).getMessages();
    res[ChatType.CHAT_SPIRITISM] = game.getChat(ChatType.CHAT_SPIRITISM).getMessages();
    LOGGER.log(`CHAT ALL CHAT END`);

    
    player.sendMessage("GET_ALL_INFO_CHAT", res);
};

// Liste des événements relatifs aux messages
Event.registerHandlers("CHAT_SENT", newMessage);
Event.registerHandlers("GET_ALL_INFO", getAllChats);
Event.registerHandlers("USE_POWER_SPIRITISM", updateChat);
