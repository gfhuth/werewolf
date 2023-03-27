import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import database from "../util/database";

const { JWT_SECRET } = process.env;

function getTokenContent(token): { username: string } {
    const isValid = jwt.verify(token, JWT_SECRET);
    if (!isValid) throw new Error("Invalid Token !");

    const username = (jwt.decode(token) as { username: string }).username;
    return {
        username: username
    };
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    if (!username) {
        res.status(400).send("Missing username");
        return;
    }
    if (!password) {
        res.status(400).send("Missing password");
        return;
    }

    try {
        const user = await database.selectFrom("users").select(["username", "password"]).where("username", "=", username).executeTakeFirstOrThrow();
        if (!user) {
            res.status(500).send("Invalid username or invalid password");
            return;
        }
        if (!(await bcrypt.compare(password, user.password))) {
            res.status(500).send("Invalid username or invalid password");
            return;
        }
    } catch (e) {
        res.status(500).send("Invalid username or invalid password");
        return;
    }

    const token: string = jwt.sign(
        {
            username: username
        },
        JWT_SECRET
    );

    res.status(200).json({
        token: token
    });
};

export const whoAmI = async (req: Request, res: Response): Promise<void> => {
    try {
        const username: string = getTokenContent(req.headers["x-access-token"]).username;
        res.json({ username: username });
    } catch (e) {
        res.sendStatus(400);
    }
};

export const register = async (req: Request<any, any, { username: string; password: string }>, res: Response): Promise<void> => {
    const { username, password } = req.body;
    // TODO: il y a peut-être des conditions à vérifier sur username et password
    if (!username) {
        res.status(400).send("Missing username");
        return;
    }
    if (!password) {
        res.status(400).send("Missing password");
        return;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    //TODO: vérifier que l'utilisateur n'existe pas déjà

    try {
        await database.insertInto("users").values({ username: username, password: hashPassword }).execute();
    } catch (e) {
        res.sendStatus(500);
    }

    const token: string = jwt.sign(
        {
            username: username
        },
        JWT_SECRET
    );

    res.status(200).json({
        token: token
    });
};
