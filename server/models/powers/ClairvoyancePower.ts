import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game } from "../gameModel";
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
        throw new Error("Not Implemented yet");
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_CLAIRVOYANCE"]): void {
        throw new Error("Method not implemented.");
    }

}

Event.registerHandlers("USE_POWER_CONTAMINATION", usePower);
