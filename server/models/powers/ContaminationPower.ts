import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class ContaminationPower extends Power {

    public static POWERNAME = "CONTAMINATION";
    private victim: Player;

    public constructor() {
        super(ContaminationPower.POWERNAME, true);
    }

    public isCompatibleWith(player: Player): boolean {
        return player.isWerewolf();
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CONTAMINATION"]): void {
        if (player.getPower().getName() !== ContaminationPower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have contamination power");
            return;
        }
        const victim: Player = game.getPlayer(data.target);
        if (victim.isDead()) {
            player.sendError("POWER_ERROR", 403, "Contaminated player is dead");
            return;
        }

        this.addTarget(victim);
    }

    public applyPower(game: Game, player: Player): void {
        this.getTargets()[0].setWerewolf(true);
    }

}

Event.registerHandlers("USE_POWER_CONTAMINATION", usePower);
