import express from "express";
import * as gameController from "../controllers/gameController";
import { verifyToken } from "../controllers/authenticationController";
const gameRouter = express.Router();

gameRouter.get("/search", verifyToken, gameController.searchGame);
gameRouter.get("/:id/details", verifyToken, gameController.searchGameById);
gameRouter.get("/me", verifyToken, gameController.searchGameByUsername);
gameRouter.post("/new", verifyToken, gameController.newGame);

export default gameRouter;
