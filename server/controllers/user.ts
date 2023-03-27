import jwt from "jsonwebtoken";
import { Request, Response } from "express";
const { JWT_SECRET } = process.env;

function getTokenContent(token): {username:string} {
    const isValid = jwt.verify(token, JWT_SECRET);
    if (!isValid) throw new Error("Invalid Token !");

    const username = (jwt.decode(token) as {username:string}).username;
    return {
        username: username
    };
}

export const getToken = async (req: Request, res: Response): Promise<void> => {
    const username: string = req.body.username;

    const token: string = jwt.sign(
        {
            username: username
        },
        // le secret est a generer par u
        JWT_SECRET
    );

    res.status(200).json({
        token: token
    });
};

export const whoAmI = async (req: Request, res: Response): Promise<void> => {
    const username = getTokenContent(req.headers["x-access-token"]);
    res.json({ data: username });
};
