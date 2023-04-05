import { Request, Response } from "express";
import { getTokenContent } from "./userController";
import { MessageObject, createMessage, getMessagesFromChat } from "../models/messageModel";

export const newMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        // TODO: vérifier que username est dans le base de données
    } catch (e) {
        res.sendStatus(400);
    }

    const game: number = Number.parseInt(req.params.gameid);
    // TODO: vérifier que la partie est bien définie

    const message: { game: number, chat: number; player: number; text: string } = {
        game: game,
        chat: req.body.chat,
        player: req.body.player,
        text: req.body.text
    };
    // TODO: vérifier que le message est sans erreurs

    try {
        await createMessage(message);
    } catch (e) {
        res.sendStatus(500);
    }

    res.status(200).json({ message: "Message posted" });
};

export const listMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        // TODO: vérifier que username est dans le base de données
    } catch (e) {
        res.sendStatus(400);
    }

    const game: number = Number.parseInt(req.params.gameid);
    // TODO: vérifier que la partie est bien définie

    const chat: number = Number.parseInt(req.params.chatid);
    // TODO: vérifier que la partie est bien définie

    const messages: Array<MessageObject> = await getMessagesFromChat(game, chat);

    res.status(200).json(messages);
};
