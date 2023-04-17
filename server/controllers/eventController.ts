import { Game } from "../models/gameModel";
import { User } from "../models/userModel";

type functionHandler = (game: Game, user: User, data: Record<string, any>) => void;

export class Event {

    private static eventHandlers: {
        [key: string]: Array<functionHandler>;
    } = {};

    public static getEventActions(event: string): Array<functionHandler> {
        if (Event.eventHandlers[event]) return Event.eventHandlers[event];
        return null;
    }

    public static registerHandlers(event: string, func: functionHandler): void {
        if (Event.eventHandlers[event]) Event.eventHandlers[event].push(func);
        else Event.eventHandlers[event] = [func];
    }

}
