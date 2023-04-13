import { Game } from "../models/gameModel";
import database from "../util/database";

/** Add all the player who have join the game in the player list of game
 * @param {Game} game game to add player
 */
function addPlayerInGame(game: Game): void {
    console.log("TODO : Adding player in game");
}

/** Set all role in the game
 * @param {Game} game Game with all player added
 */
function setupGame(game: Game): void {
    console.log("TODO : Start game by setting all role and data");
}

/** Apply all action happend during the night and lunch a day
 * @param {Game} game Game to apply change
 */
function startDay(game: Game): void {
    console.log("TODO : The sun is rising");
}

/** Apply all action happend during the day and lunch a night
 * @param {Game} game Game to apply change
 */
function startNight(game: Game): void {
    console.log("TODO : The night is arriving");
}

/** Function to add when a game is restored or start
 * Setup the game (probability, role, ...)
 * Add event call at each end of days (use interval or timeout), ...
 * @param {number} gameID id of the starting game 
 * */ 
export function initGame(gameID: number): void {
    const gameDb = database.selectFrom("games").selectAll().where("id", "=", gameID).executeTakeFirst();
    const game = Game.gameDBtoGame(gameDb);
    addPlayerInGame(game);
    const gameStatus = game.getStatus();
    if (gameStatus <= 1) setupGame(game);

    console.log(`game ${gameID} successfuly started`);
    if (gameStatus % 2 == 1) 
        startDay(game);
    else 
        startNight(game);
}
