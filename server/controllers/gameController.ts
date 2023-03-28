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

    const game: GameObject = {
        nbPlayerMin: req.body.nbPlayerMin,
        nbPlayerMax: req.body.nbPlayerMax,
        dayLength: req.body.dayLength,
        nightLength: req.body.nightLength,
        startDate: new Date(req.body.startDate).getTime(),
        percentageWerewolf: req.body.percentageWerewolf,
        probaContamination: req.body.probaContamination,
        probaInsomnie: req.body.probaInsomnie,
        probaVoyance: req.body.probaVoyance,
        probaSpiritisme: req.body.probaSpiritisme
    };

    // Vérifier les valeurs du body de la reqête

    try {
        await createGame(game);
    } catch (e) {
        res.sendStatus(500);
    }

    res.status(200).json({ message: "New game created" });
};
