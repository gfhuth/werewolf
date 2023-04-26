import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class ContaminationPower extends Power {

    public constructor() {
        super("CONTAMINATION");
    }

    public isCompatibleWith(player: Player): boolean {
        return player.isWerewolf();
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CONTAMINATION"]): void {
        throw new Error("Method not implemented.");
    }

}

Event.registerHandlers("USE_POWER_CONTAMINATION", usePower);
