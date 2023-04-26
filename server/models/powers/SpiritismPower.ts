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
        // The game begins in the night
        this.ready = false; 
    }

    public isCompatibleWith(player: Player): boolean {
        throw new Error("Not Implemented yet");
    }

    public usePower(game: Game, player: Player, data: ClientToServerEvents["USE_POWER_SPIRITISM"]): void {
        throw new Error("Method not implemented.");
    }

}

Event.registerHandlers("USE_POWER_CONTAMINATION", usePower);
