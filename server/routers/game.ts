import express from "express";
import * as gameController from '../controllers/gameController'
const router = express.Router();

router.get("/game/search", gameController.searchGame);
router.get("/game/:id", gameController.searchGameById);
router.get("/game/myGames", gameController.searchGameByUsername);
router.get("/game/myGames", gameController.newGame);

export default router;