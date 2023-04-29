import { Game } from "../gameModel";
import { Player } from "../playerModel";
import Power from "../powerModelBetter";

export default class InsomniaPower extends Power {

    public static POWERNAME = "INSOMNIA";

    public constructor() {
        super(InsomniaPower.POWERNAME);
    }

    public isCompatibleWith(player: Player): boolean {
        return !player.isWerewolf();
    }

    public usePower(game: Game, player: Player, data: Record<string, any>): void {
        throw new Error("Method not implemented.");
    }

}
