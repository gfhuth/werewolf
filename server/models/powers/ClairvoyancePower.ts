import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game, Role } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class ClairvoyancePower extends Power {

    public static POWERNAME = "CLAIRVOYANCE";
    private victim: Player;

    public constructor() {
        super(ClairvoyancePower.POWERNAME);
        // The game begins in the night
        this.ready = false;
    }

    public isCompatibleWith(player: Player): boolean {
        return true;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CLAIRVOYANCE"]): void {
        if (player.getPower().getName() !== ClairvoyancePower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have clairvoyance power");
            return;
        }

        const victim: Player = game.getPlayer(data.target);
        const roleVictim: Role = victim.isWerewolf() ? Role.WEREWOLF : Role.VILLAGER;
        player.sendMessage("CLAIRVOYANCE_RESPONSE", { role: roleVictim, power: victim.getPower().getName() });
        this.ready = true;
    }

}

Event.registerHandlers("USE_POWER_CLAIRVOYANCE", usePower);