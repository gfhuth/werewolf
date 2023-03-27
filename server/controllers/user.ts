import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import database from "../util/database";
import { insertUser } from "../models/userModel";

const { JWT_SECRET } = process.env;

function getTokenContent(token: string): { username: string } {
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
        const username: string = getTokenContent(req.headers["x-access-token"] as string).username;
        res.status(200).json({ username: username });
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

    // On s'assure que le nom d'utilisateur n'est pas déjà utilisé
    try {
        const user = (await database.selectFrom("users").select(["username"]).where("username", "=", username).executeTakeFirstOrThrow()).username;
        if (user) {
            res.status(409).send("User already exists");
            return;
        }
    } catch (e) {}

    // Insertion de l'utilisateur dans la base de données
    try {
        insertUser({ username: username, password: hashPassword });
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
