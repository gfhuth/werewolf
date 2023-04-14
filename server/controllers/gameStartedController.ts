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
    // update death player
    // activate vote for each player, desactivate power of werewolf
    // send a message at every connected client
    // call startNight at the end of the day
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setTimeout(() => startNight(game), game.getGameParam().dayLength * 1000);
}

/** Apply all action happend during the day and lunch a night
 * @param {Game} game Game to apply change
 */
function startNight(game: Game): void {
    console.log("TODO : The night falling");
    // update death player
    // desactivated vote for each player, activate power
    // send a message at every connected client
    // call startDay at the end of the day
    setTimeout(() => startDay(game), game.getGameParam().nightLength * 1000);
}

/** Function to add when a game is restored or start
 * Setup the game (probability, role, ...)
 * Add event call at each end of days (use interval or timeout), ...
 * @param {number} gameId id of the starting game
 * */
export async function initGame(gameId: number): Promise<void> {
    const game: Game = await Game.load(gameId);
    addPlayerInGame(game);
    const gameStatus = game.getStatus();
    if (gameStatus.status == 0) setupGame(game);

    console.log(`game ${gameId} successfuly started`);
    if (gameStatus.status % 2 == 0) startDay(game);
    else startNight(game);
}
