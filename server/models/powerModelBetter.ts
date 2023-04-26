import { Game } from "./gameModel";
import { Player } from "./playerModel";

export default abstract class Power {

    private name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public abstract isCompatibleWith(player: Player): boolean;
    
    public getName(): string {
        return this.name;
    }

    public abstract usePower(game: Game, player: Player, data: Record<string, any>): void;

}
