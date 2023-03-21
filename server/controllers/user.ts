import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const getToken = async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    const token: string = jwt.sign(
        {
            username: username,
            password: password
        },
        "secret"
    );

    res.status(200).json({
        token: token
    });
};

