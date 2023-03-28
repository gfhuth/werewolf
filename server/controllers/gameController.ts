import { Request, Response } from "express";
import { getTokenContent } from "./userController";
import { GameObject, createGame } from "../models/gameModel";

// export async function searchGame(req: Request, res: Response) {
//     //game list from SQLdatabase;
//     console.log("aaa");
//     try {
//         // Récupérer la liste des jeux depuis la base de données SQL
//         // À compléter avec la requête appropriée

//         // Exemple de réponse avec un jeu
//         const example = [
//             new Game(
//                 {
//                     id: 1,
//                     maxNbPlayer: 10,
//                     dayLenght: 12,
//                     nightLenght: 12,
//                     startDate: new Date("2023-04-27T18:30:00"),
//                     percentWereWolf: 0.3,
//                     proba: { contamination: 0.5, insomnie: 0.5, voyance: 0.5, spiritisme: 0.5 }
//                 },
//                 "Mon zizi"
//             ).toShortJson()
//         ];
//         res.status(200).json({ games: example });
//     } catch (err) {
//         console.log(err);
//         res.sendStatus(200);
//     }
// }

// export async function searchGameById(req: Request, res: Response) {
//     try {
//         const gameId: String = req.params.id;
//         if (!gameId) throw new Error("No game given in URL!");
//         // Récupérer le jeu depuis la base de données SQL avec l'ID
//         // À compléter avec la requête appropriée

//         //example:
//         const ex: Game = new Game(
//             {
//                 id: 1,
//                 maxNbPlayer: 10,
//                 dayLenght: 12,
//                 nightLenght: 12,
//                 startDate: new Date("2023-04-27T18:30:00"),
//                 percentWereWolf: 0.3,
//                 proba: { contamination: 0.5, insomnie: 0.5, voyance: 0.5, spiritisme: 0.5 }
//             },
//             "Zisou"
//         );
//         res.status(200).json({ game: ex.toLongJson() });
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// }

// export async function searchGameByUsername(req, res) {
//     try {
//         const token = req.headers.authorization;
//         // Vérifier la validité du token
//         // À compléter avec la vérification appropriée
//         if (!jwt.verify(token, "secret")) throw new Error("Unverified token");
//         //Decode
//         // Récupérer les jeux depuis la base de données SQL avec le nom d'utilisateur
//         // À compléter avec la requête appropriée

//         // Exemple de réponse avec un jeu
//         const example = [
//             new Game(
//                 {
//                     id: 1,
//                     maxNbPlayer: 10,
//                     dayLenght: 12,
//                     nightLenght: 12,
//                     startDate: new Date("2023-04-27T18:30:00"),
//                     percentWereWolf: 0.3,
//                     proba: { contamination: 0.5, insomnie: 0.5, voyance: 0.5, spiritisme: 0.5 }
//                 },
//                 "Mon zizi"
//             ).toShortJson()
//         ];
//         res.status(200).json({ games: example });

//         res.status(200).json({ games: [] });
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// }

export const newGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = getTokenContent(req.headers["x-access-token"] as string).username;
        // TODO: vérifier que username est dans le base de données
    } catch (e) {
        res.sendStatus(400);
    }

    // Valeur par défaut de la date
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(8);
    defaultDate.setMinutes(0);
    defaultDate.setMilliseconds(0);

    const today = new Date();

    const game: GameObject = {
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

    // Vérification des valeurs du body de la requête
    if (game.probaContamination < 0 || game.probaContamination > 1) {
        res.status(406).send("Unvalid contamination probability");
        return;
    }
    if (game.probaInsomnie < 0 || game.probaInsomnie > 1) {
        res.status(406).send("Unvalid contamination probability");
        return;
    }
    if (game.probaVoyance < 0 || game.probaVoyance > 1) {
        res.status(406).send("Unvalid contamination probability");
        return;
    }
    if (game.probaSpiritisme < 0 || game.probaSpiritisme > 1) {
        res.status(406).send("Unvalid contamination probability");
        return;
    }
    if (game.percentageWerewolf < 0 || game.percentageWerewolf > 100) {
        res.status(406).send("Unvalid contamination probability");
        return;
    }
    if (game.dayLength > 24 * 60) {
        res.status(406).send("Day length too long");
        return;
    }
    if (game.nightLength > 24 * 60) {
        res.status(406).send("Night length too long");
        return;
    }
    if (game.nbPlayerMin <= 1) {
        res.status(406).send("There must be at least two players");
        return;
    }
    if (game.nbPlayerMax > 500) {
        res.status(406).send("Too many players");
        return;
    }
    if (game.startDate < today.getTime()) {
        res.status(406).send("Start date passed");
        return;
    }

    try {
        await createGame(game);
    } catch (e) {
        res.sendStatus(500);
    }

    res.status(200).json({ message: "New game created" });
};
