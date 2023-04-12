import { Request, Response } from "express";
import { getTokenContent } from "./userController";
import { Game, GameParam, gamesList } from "../models/gameModel";
import database from "../util/database";

export async function searchGame(req: Request, res: Response): Promise<void> {
    //game list from SQLdatabase;
    try {
        console.log("aaa");
        // Récupérer la liste des jeux depuis la base de données SQL et le username
        const games = await database.selectFrom("games").selectAll().execute();

        // Convertir le jeu en JSON et l'envoyer dans la réponse
        const gamesJson = [];
        games.forEach((game) => {
            gamesJson.push(Game.gameDBtoGame(game).toShortJson());
        });
        res.status(200).json({ games: gamesJson });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function searchGameById(req: Request, res: Response): Promise<void> {
    try {
        const gameId: number = parseInt(req.params.id);
        if (!gameId) throw new Error("Invalid game ID provided.");

        // Récupérer le jeu depuis la base de données SQL avec l'ID
        const games = await database.selectFrom("games").selectAll().where("id", "=", gameId).limit(1).execute();
        if (games.length === 0) throw new Error(`Game with ID ${gameId} not found.`);
        // Renvoyer la parti en longJson
        res.status(200).json(Game.gameDBtoGame(games[0]).toLongJson());
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

export async function searchGameByUsername(req: Request, res: Response): Promise<void> {
    try {
        const username: string = getTokenContent(req.headers["x-access-token"] as string).username;
        if (!username) throw new Error("No username provided.");
        console.log(username);
        // Récupérer les jeux depuis la base de données SQL avec le nom d'utilisateur
        const games = await database.selectFrom("games").selectAll().where("games.hostname", "=", username).execute();
        console.log(games);
        // Convertir le jeu en JSON et l'envoyer dans la réponse
        const gamesJson = [];
        games.forEach((game) => {
            gamesJson.push(Game.gameDBtoGame(game).toShortJson());
        });
        res.status(200).json({ games: gamesJson });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

export const newGame = async (req: Request, res: Response): Promise<void> => {
    console.log("verif en cours");
    const hostName = getTokenContent(req.headers["x-access-token"] as string).username;
    // Valeur par défaut de la date
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(8);
    defaultDate.setMinutes(0);
    defaultDate.setMilliseconds(0);

    const today = new Date();

    const game = {
        hostName: hostName,
        currentNumberOfPlayer: 1,
        nbPlayerMin: req.body.nbPlayerMin || 5,
        nbPlayerMax: req.body.nbPlayerMax || 20,
        dayLength: req.body.dayLength || 60 * 14,
        nightLength: req.body.nightLength || 60 * 10,
        startDate: new Date(req.body.startDate).getTime() || defaultDate.getTime(),
        percentageWerewolf: req.body.percentageWerewolf || 0.33,
        probaContamination: req.body.probaContamination || 0,
        probaInsomnie: req.body.probaInsomnie || 0,
        probaVoyance: req.body.probaVoyance || 0,
        probaSpiritisme: req.body.probaSpiritisme || 0
    };

    const conditions = [
        { minRange: 0, value: game.probaContamination, maxRange: 1, errorMessage: "Unvalid contamination probability" },
        { minRange: 0, value: game.probaInsomnie, maxRange: 1, errorMessage: "Unvalid contamination probability" },
        { minRange: 0, value: game.probaVoyance, maxRange: 1, errorMessage: "Unvalid contamination probability" },
        { minRange: 0, value: game.probaSpiritisme, maxRange: 1, errorMessage: "Unvalid contamination probability" },
        { minRange: 0, value: game.percentageWerewolf, maxRange: 100, errorMessage: "Unvalid contamination probability" },
        { minRange: 0, value: game.dayLength, maxRange: 24 * 60, errorMessage: "Day length too long" },
        { minRange: 0, value: game.nightLength, maxRange: 24 * 60, errorMessage: "Night length too long" },
        { minRange: 2, value: game.nbPlayerMin, maxRange: Infinity, errorMessage: "There must be at least two players" },
        { minRange: 0, value: game.nbPlayerMax, maxRange: 500, errorMessage: "Too many players" },
        { minRange: today.getTime(), value: game.startDate, maxRange: Infinity, errorMessage: "Start date passed" }
    ];

    for (let i = 0; i < conditions.length; i++) {
        const cond = conditions[i];
        if (cond.value < cond.minRange || cond.value > cond.maxRange) {
            res.status(406).send(cond.errorMessage);
            return;
        }
    }

    const gameParam: GameParam = {
        nbPlayerMin: game.nbPlayerMin,
        nbPlayerMax: game.nbPlayerMax,
        dayLength: game.dayLength,
        nightLength: game.nightLength,
        startDate: game.startDate,
        percentageWerewolf: game.percentageWerewolf,
        probaContamination: game.probaContamination,
        probaInsomnie: game.probaInsomnie,
        probaVoyance: game.probaVoyance,
        probaSpiritisme: game.probaSpiritisme
    };

    try {
        console.log("creation en cours");
        const gameId: { id: number } = await database.insertInto("games").values(game).returning("id").executeTakeFirstOrThrow();

        // On ajoute la partie créée à la liste de toutes les parties
        gamesList.push(new Game(gameId.id, gameParam, game.hostName));
    } catch (e) {
        res.sendStatus(500);
    }

    res.status(200).json({ message: "New game created" });
};

export const getGame = (gameId: number): Game => {
    for (const game of gamesList) if (game.getGameId() === gameId) return game;
    return null;
};
