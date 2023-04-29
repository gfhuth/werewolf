import { Game } from "./gameModel";
import { Player } from "./playerModel";

export default abstract class Power {

    private name: string;
    private alreadyUsed: boolean;
    protected dataForDayPower: Record<string, any>;

    public constructor(name: string) {
        this.name = name;
        this.alreadyUsed = false;
    }

    public abstract isCompatibleWith(player: Player): boolean;
    
    public getName(): string {
        return this.name;
    }

    public setAlreadyUsed(isUsed: boolean): void {
        this.alreadyUsed = isUsed;
    }

    public getAlreadyUsed(): boolean {
        return this.alreadyUsed;
    }

    public getDataForDayPower(): Record<string, any> {
        return this.dataForDayPower;
    }

    public abstract usePower(game: Game, player: Player, data: Record<string, any>): void;

}
