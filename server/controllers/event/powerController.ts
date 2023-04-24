import { Chat, Chat_type, Message } from "../../models/chatModel";
import { Game } from "../../models/gameModel";
import { Clairvoyant, Contamination, Spiritism } from "../../models/powersModel";
import { User } from "../../models/userModel";
import { Werewolf } from "../../models/villagerModel";
import database from "../../util/database";
import { Event } from "../eventController";

const usePower = async (game: Game, user: User, data: {victimId: string}): Promise<void> => {
    const player = game.getPlayer(user.getUsername());
    const power = player.getRole().getPower();
    const victim = game.getPlayer(data.victimId);
    if (power == null) {
        user.sendMessage({ event: "USE_POWER", status: 403, message: "You don't have power" });
        return;
    } else if (victim == null) {
        user.sendMessage({ event: "USE_POWER", status: 403, message: "The victim isn't in the game" });
        return;
    } else if ( power instanceof Contamination || 
                power instanceof Spiritism || 
                power instanceof Clairvoyant) {
        if (!data.victimId) {
            user.sendMessage({ event: "USE_POWER", status: 403, message: "You need to set a victim" });
            return;
        } else if (power instanceof Contamination && victim.getRole() instanceof Werewolf) {
            user.sendMessage({ event: "USE_POWER", status: 403, message: "Your victim must to be an Human" });
            return;
        } else {
            power.setVictim(victim);
        }
    }
    // TODO: else if the power was already used in the day/night
    power.usePower();
    return;
};

// Liste des événements relatifs aux messages
Event.registerHandlers("USE_POWER", usePower);
