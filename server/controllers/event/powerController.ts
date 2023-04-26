import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { Event } from "../eventController";

export const usePower = async (game: Game, player: Player, data: Record<string, any>): Promise<void> => {
    const power = player.getPower();

    if (!power) {
        player.sendError("USE_POWER", 403, "You don't have power");
        return;
    } 
    
    power.usePower(game, player, data);
};

// Liste des événements relatifs aux messages
Event.registerHandlers("USE_POWER", usePower);
