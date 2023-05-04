import { Game } from "./gameModel";
import { Player } from "./playerModel";

export default abstract class Power {

    private name: string;
    private alreadyUsed: boolean;
    private applyDay: boolean;
    private targets: Array<Player>;

    public constructor(name: string, applyDay: boolean) {
        this.name = name;
        this.alreadyUsed = false;
        this.applyDay = applyDay;
        this.targets = [];
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

    public getApplyDay(): boolean {
        return this.applyDay;
    }

    public getTargets(): Array<Player> {
        return this.targets;
    }

    public addTarget(target: Player): void {
        this.targets.push(target);
    }

    public abstract usePower(game: Game, player: Player, data: Record<string, any>): void;

    public abstract applyPower(game: Game, player: Player): void;

}
