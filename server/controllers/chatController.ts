import { Request, Response } from "express";
import { getTokenContent } from "./userController";
import { createChat } from "../models/chatModel";

export const newChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        // TODO: vérifier que username est dans le base de données
    } catch (e) {
        res.sendStatus(400);
    }

    const game: number = Number.parseInt(req.params.gameid);
    // TODO: vérifier que la partie est bien définie

    try {
        await createChat(game);
    } catch (e) {
        res.sendStatus(500);
    }

    res.status(200).json({ message: "New chat created" });
};
