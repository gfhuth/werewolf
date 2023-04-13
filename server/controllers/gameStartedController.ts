import { Game } from "../models/gameModel";
import database from "../util/database";

function addPlayerInGame(game: Game): void {
    console.log("TODO : Adding player in game");
}
function setupGame(game: Game): void {
    console.log("TODO : Start game by setting all role and data");
}

function startDay(game: Game): void {
    console.log("TODO : The sun is rising");
}
function startNight(game: Game): void {
    console.log("TODO : The night is arriving");
}
/// Function call when a game start
/// Setup the game (probability, role, ...)
/// Add event call at each end of days (use interval or timeout), ...
export function initGame(gameID: number): void {
    const gameDb = database.selectFrom("games").selectAll().where("id", "=", gameID).executeTakeFirst();
    const game = Game.gameDBtoGame(gameDb);
    addPlayerInGame(game);
    const gameStatus = game.getStatus();
    if (gameStatus <= 1) setupGame(game);

    console.log(`game ${gameID} successfuly started`);
    if (gameStatus % 2 == 0) 
        startDay(game);
    else 
        startNight(game);
}
