import express from "express";
import * as gameController from "../controllers/gameController";
const gameRouter = express.Router();

// gameRouter.get("/search", gameController.searchGame);
// gameRouter.get("/:id", gameController.searchGameById);
// gameRouter.get("/myGames", gameController.searchGameByUsername);
gameRouter.post("/new", gameController.newGame);

export default gameRouter;
