import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import Logger from "../../util/Logger";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

const LOGGER = new Logger("SPIRITISM");

export default class SpiritismPower extends Power {

    public static POWERNAME = "SPIRITISM";
    private victim: Player;

    public constructor() {
        super(SpiritismPower.POWERNAME, false);
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

        this.addTarget(deadPlayer);
        this.applyPower(game, player);
    }

    public applyPower(game: Game, player: Player): void {
        game.setChatSpiritism(player, this.getTargets()[0]);
        LOGGER.log(`Spiritism power applied (${player.getUser().getUsername()} and ${this.getTargets()[0].getUser().getUsername()} can now discuss in the spiritism chat`);
    }

}

Event.registerHandlers("USE_POWER_SPIRITISM", usePower);
