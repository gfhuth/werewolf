import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class SpiritismPower extends Power {

    public static POWERNAME = "SPIRITISM";
    private victim: Player;

    public constructor() {
        super(SpiritismPower.name);
    }

    public isCompatibleWith(player: Player): boolean {
        return true;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_SPIRITISM"]): void {
        if (player.getPower().getName() !== SpiritismPower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have spiritism power");
            return;
        }

        const deadPlayer: Player = game.getPlayer(data.target);
        if (!deadPlayer.isDead()) {
            player.sendError("POWER_ERROR", 403, "Dead player is not dead");
            return;
        }

        game.setChatSpiritism(player, deadPlayer);
    }

}

Event.registerHandlers("USE_POWER_SPIRITISM", usePower);
