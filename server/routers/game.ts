import express from "express";
import * as gameController from "../controllers/gameSetupController";
import { verifyToken } from "../controllers/authenticationController";
const gameRouter = express.Router();

gameRouter.get("/search", verifyToken, gameController.searchGame);
gameRouter.get("/:id/details", verifyToken, gameController.searchGameById);
gameRouter.get("/me", verifyToken, gameController.searchGameByUsername);
gameRouter.post("/new", verifyToken, gameController.newGame);
gameRouter.post("/:id/join", verifyToken, gameController.joinGame);
gameRouter.post("/:id/join", verifyToken, gameController.leaveGame);
export default gameRouter;
