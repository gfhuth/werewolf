import { Game } from "../models/gameModel";

type functionHandler = (game: Game, data: Record<string, any>) => void;

export let eventHandlers: {
    [key: string]: Array<functionHandler>;
};

export function registerHandler(event: string, func: functionHandler): void {
    if (eventHandlers[event]) eventHandlers[event].push(func);
    else eventHandlers[event] = [func];
}
