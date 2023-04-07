import { Game } from "../models/gameModel";
import { User } from "../models/userModel";
import { newMessage } from "./messageController";

type functionHandler = (game: Game, user: User, data: Record<string, any>) => void;

export const eventHandlers: {
    [key: string]: Array<functionHandler>;
} = {};

export function registerHandlers(): void {
    eventHandlers.CHAT_SENT = [newMessage];
}
