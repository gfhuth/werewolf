import jwt from "jsonwebtoken";
import { Request, Response } from "express";

function validToken(token) {
    const isValid: boolean = jwt.verify(token, "secret", { algorithms: ["RS256"] });
    if (!isValid) throw new Error("Invalid Token !");

    const username = jwt.decode(token, "secret", { algorithms: ["RS256"] }).username;
    const password = jwt.decode(token, "secret", { algorithms: ["RS256"] }).password;
    return {
        username: username,
        password: password
    };
}

export const getToken = async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    const token: string = jwt.sign(
        {
            username: username,
            password: password
        },
        // le secret est a generer par u
        "secret",
        { algorithm: "RS256" }
    );

    res.status(200).json({
        token: token
    });
};
