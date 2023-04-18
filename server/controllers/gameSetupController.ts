import { Request, Response } from "express";
import { getTokenContent } from "./userController";
import { Game, GameParam } from "../models/gameModel";
import database from "../util/database";
import { initGame } from "./gameStartedController";

import { User } from "../models/userModel";
import { Player } from "../models/playerModel";

export async function searchGame(req: Request, res: Response): Promise<void> {
    //game list from SQLdatabase;
    try {
        // Récupérer la liste des jeux depuis la base de données SQL et le username
        const games: Array<{ id: number; startDate: number; hostId: number; nbPlayerMax: number; currentNumberOfPlayer: number }> = await database
            .selectFrom("games")
            .select(["id", "startDate", "hostId", "nbPlayerMax", "currentNumberOfPlayer"])
            .execute();

        res.status(200).json({ games: games });
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
        const game: {
            id: number;
            nbPlayerMax: number;
            dayLength: number;
            nightLength: number;
            startDate: number;
            percentageWerewolf: number;
            probaContamination: number;
            probaInsomnie: number;
            probaVoyance: number;
            probaSpiritisme: number;
            hostId: number;
            currentNumberOfPlayer: number;
            wereWolfCount?: number;
        } = await database
            .selectFrom("games")
            .select([
                "id",
                "nbPlayerMax",
                "dayLength",
                "nightLength",
                "startDate",
                "percentageWerewolf",
                "probaContamination",
                "probaInsomnie",
                "probaVoyance",
                "probaSpiritisme",
                "hostId",
                "currentNumberOfPlayer"
            ])
            .where("id", "=", gameId)
            .executeTakeFirstOrThrow();

        game.wereWolfCount = Math.floor((game.nbPlayerMax * game.percentageWerewolf) / 100);
        // Renvoyer la parti en longJson
        res.status(200).json(game);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

export async function searchGameByUsername(req: Request, res: Response): Promise<void> {
    try {
        const user: User = User.getUser(getTokenContent(req.headers["x-access-token"] as string).username);
        // Récupérer les jeux depuis la base de données SQL avec le nom d'utilisateur
        const games: Array<{ id: number; startDate: number; hostId: number; nbPlayerMax: number; currentNumberOfPlayer: number }> = await database
            .selectFrom("games")
            .select(["id", "startDate", "hostId", "nbPlayerMax", "currentNumberOfPlayer"])
            .where("games.hostId", "=", user.getUserId())
            .execute();

        res.status(200).json({ games: games });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

export const newGame = async (req: Request, res: Response): Promise<void> => {
    const user: User = User.getUser(getTokenContent(req.headers["x-access-token"] as string).username);
    // Valeur par défaut de la date
    let date: number = Date.parse(req.body.startDate);
    if (date) date = new Date(date).getTime();
    else date = Date.now() + 1000 * 60 * 60 * 8;

    const game = {
        hostId: user.getUserId(),
        currentNumberOfPlayer: 1,
        nbPlayerMin: req.body.nbPlayerMin || 5,
        nbPlayerMax: req.body.nbPlayerMax || 20,
        dayLength: req.body.dayLength || 60 * 14 * 60,
        nightLength: req.body.nightLength || 60 * 10 * 60,
        startDate: date,

        percentageWerewolf: req.body.percentageWerewolf || 0.33,
        probaContamination: req.body.probaContamination || 0,
        probaInsomnie: req.body.probaInsomnie || 0,
        probaVoyance: req.body.probaVoyance || 0,
        probaSpiritisme: req.body.probaSpiritisme || 0
    };
    const conditions = [
        { minRange: 0, value: game.probaContamination, maxRange: 1, errorMessage: "Unvalid contamination probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaInsomnie, maxRange: 1, errorMessage: "Unvalid Insomnie probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaVoyance, maxRange: 1, errorMessage: "Unvalid Voyance probabilityShould be in [0,1]" },
        { minRange: 0, value: game.probaSpiritisme, maxRange: 1, errorMessage: "Unvalid Spiritisme probability Should be in [0,1]" },
        { minRange: 0, value: game.percentageWerewolf, maxRange: 1, errorMessage: "Unvalid wereWolf quantity : Should be in [0,1]" },
        { minRange: 0, value: game.dayLength, maxRange: 24 * 60 * 60, errorMessage: "Day length in seconde too long " },
        { minRange: 0, value: game.nightLength, maxRange: 24 * 60 * 60, errorMessage: "Night length in seconde too long" },
        { minRange: 2, value: game.nbPlayerMin, maxRange: 498, errorMessage: "There must be at least two players" },
        { minRange: game.nbPlayerMin, value: game.nbPlayerMax, maxRange: 500, errorMessage: "Too many players (MAX 500)" },
        { minRange: Date.now(), value: game.startDate, maxRange: Infinity, errorMessage: "Start date passed" }
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
        startDate: date,
        percentageWerewolf: game.percentageWerewolf,
        probaContamination: game.probaContamination,
        probaInsomnie: game.probaInsomnie,
        probaVoyance: game.probaVoyance,
        probaSpiritisme: game.probaSpiritisme
    };

    try {
        const gameId: { id: number } = await database.insertInto("games").values(game).returning("id").executeTakeFirstOrThrow();
        const newHostGame: Game = new Game(gameId.id, gameParam);

        await database
            .insertInto("players")
            .values({
                name: user.getUsername(),
                role: null,
                power: null,
                user: user.getUserId(),
                game: gameId.id
            })
            .execute();

        // On ajoute la partie à la liste des parties
        Game.addGameInList(newHostGame);

        // On ajoute l'utilisateur aux joueurs de la partie
        // TODO: ajuster les valeurs de role et power
        const player: Player = new Player(user, null, null, newHostGame);
        newHostGame.addPlayer(player);

        // On ajoute un evenement
        setTimeout(() => initGame(gameId.id), game.startDate - Date.now());
        res.status(200).json({ message: `New game created and start in ${(game.startDate - Date.now()) / 60000} min` });
    } catch (e) {
        res.sendStatus(500);
    }
};

export const joinGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const user: User = User.getUser(getTokenContent(req.headers["x-access-token"] as string).username);
        const gameId: number = parseInt(req.params.id);
        if (!gameId) throw new Error("No game ID provided.");

        const game: Game = Game.getGame(gameId);
        if (!game) throw new Error("Game doesn't exist");

        // Check if player already in game
        if (game.getPlayer(user.getUsername())) throw new Error("User is already in the game.");

        // Check if the game is full or not
        if (game.getNbOfPlayers() >= game.getGameParam().nbPlayerMax) throw new Error("Game full");

        // Ajout du joueur dans la liste des joueurs de la partie
        const player: Player = new Player(user, null, null, game);
        game.addPlayer(player);

        // Insert a new record in the user_games table
        await database
            .insertInto("players")
            .values({
                name: user.getUsername(),
                role: 0,
                power: 0,
                user: user.getUserId(),
                game: gameId
            })
            .execute();

        await database.updateTable("games").set({ currentNumberOfPlayer: game.getNbOfPlayers() }).where("id", "=", gameId).executeTakeFirst();

        res.status(200).json({ message: "game successfully join" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export const leaveGame = async (req: Request, res: Response): Promise<void> => {
    res.status(404).json({ message: "Not implemented yet" });
};
