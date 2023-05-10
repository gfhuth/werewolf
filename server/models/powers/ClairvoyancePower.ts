import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import Logger from "../../util/Logger";
import { Game, Role } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

const LOGGER = new Logger("CLAIRVOYANCE");

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
        const targetRole: Role = target.isWerewolf() ? Role.WEREWOLF : Role.HUMAN;
        const targetPower: string = target.getPower() ? target.getPower().getName() : "NO_POWER";
        player.sendMessage("CLAIRVOYANCE_RESPONSE", { role: targetRole, power: targetPower });
        LOGGER.log(`Clairvoyance power applied (target : ${targetRole} AND ${targetPower})`);
    }

}

Event.registerHandlers("USE_POWER_CLAIRVOYANCE", usePower);
