import database from "../util/database";
import { NextFunction, Request, Response } from "express";
import { getTokenContent } from "./userController";

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.headers["x-access-token"]) {
            res.status(404).send("x-access-token field not found");
            return;
        }
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        const row = await database.selectFrom("users").select(["users.id"]).where("username", "=", username).execute();
        
        if (row.length === 0) {
            res.status(404).send("Player not found");
            return;
        } else {
            return next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error connecting to database");
    }
}
