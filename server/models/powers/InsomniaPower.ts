import { ClientToServerEvents } from "../../controllers/event/eventTypes";
import { usePower } from "../../controllers/event/powerController";
import { Event } from "../../controllers/eventController";
import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class InsomniaPower extends Power {

    public constructor() {
        super("INSOMNIA");
    }

    public isCompatibleWith(player: Player): boolean {
        throw new Error("Not Implemented yet");
    }

    public usePower(game: Game, player: Player, data: Record<string, any>): void {
        throw new Error("Method not implemented.");
    }

}
