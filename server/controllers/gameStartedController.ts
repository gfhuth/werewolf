import { Game } from "../models/gameModel";

/// Function call when a game start
/// Setup the game (probability, role, ...)
/// Add event call at each end of days (use interval or timeout), ...
export function startGame(gameID: number): void {
    console.log(`game ${gameID} as started`);
    return;
}
