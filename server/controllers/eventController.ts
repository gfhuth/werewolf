import { Game } from "../models/gameModel";
import { User } from "../models/userModel";

type functionHandler = (game: Game, user: User, data: Record<string, any>) => void;

export const eventHandlers: {
    [key: string]: Array<functionHandler>;
} = {};

export function registerHandlers(event: string, func: functionHandler): void {
    if (eventHandlers[event]) eventHandlers[event].push(func);
    else eventHandlers[event] = [func];
}

