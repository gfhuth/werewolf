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
        super(ClairvoyancePower.POWERNAME, false);
    }

    public isCompatibleWith(player: Player): boolean {
        return true;
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CLAIRVOYANCE"]): void {
        if (player.getPower().getName() !== ClairvoyancePower.POWERNAME) {
            player.sendError("POWER_ERROR", 403, "Player don't have clairvoyance power");
            return;
        }

        this.addTarget(game.getPlayer(data.target));
        this.applyPower(game, player);
        this.setAlreadyUsed(true);
    }

    public applyPower(game: Game, player: Player): void {
        const target: Player = this.getTargets()[0];
        const roleVictim: Role = target.isWerewolf() ? Role.WEREWOLF : Role.HUMAN;
        player.sendMessage("CLAIRVOYANCE_RESPONSE", { role: roleVictim, power: target.getPower().getName() });
    }

}

Event.registerHandlers("USE_POWER_CLAIRVOYANCE", usePower);
