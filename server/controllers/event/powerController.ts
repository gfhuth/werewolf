import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { Clairvoyant, Contamination, Spiritism } from "../../models/powersModel";
import { User } from "../../models/userModel";
import { Human, Werewolf } from "../../models/villagerModel";
import { Event } from "../eventController";

const usePower = async (game: Game, user: User, data: { victimId: string }): Promise<void> => {
    const player = game.getPlayer(user.getUsername());
    const power = player.getRole().getPower();
    const victim = game.getPlayer(data.victimId);
    if (power === null) {
        player.sendError("USE_POWER", 403, "You don't have power");
        return;
    } else if (victim === null) {
        player.sendError("USE_POWER", 403, "The victim isn't in the game");
        return;
    } else if (power instanceof Contamination || power instanceof Spiritism || power instanceof Clairvoyant) {
        if (!data.victimId) {
            player.sendError("USE_POWER_ERROR", 403, "You need to set a victim");
            return;
        } else if (power instanceof Contamination && victim.getRole() instanceof Human) {
            player.sendError("USE_POWER_ERROR", 403, "Your victim must to be an Human");
            return;
        } else {
            power.setVictim(victim);
        }
    }
    // TODO: else if the power was already used in the day/night
    player.usePower();
    return;
};

// Liste des événements relatifs aux messages
Event.registerHandlers("USE_POWER", usePower);
