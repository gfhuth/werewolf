import { Player } from "./playerModel";

export abstract class Power {
    
    public abstract showPower(): void;
    public abstract usePower(): void;
    public getPowerValue(): number {
        return -1;
    }
    public abstract isHumanPower(): Boolean;
    public abstract isWerewolfPower(): Boolean;
    public abstract setVictim(player: Player): void;
    
}

export type HumanPower = Power;

export type WerewolfPower = Power;

export class Insomnia implements HumanPower {

    showPower(): void {
        console.log("Insomnia options:");
    }

    usePower(): void {
        console.log("Observe Werewolf chat");
    }

    isHumanPower(): Boolean {
        return true;
    }
    isWerewolfPower(): Boolean {
        return false;
    }
    getPowerValue(): number {
        return 0;
    }

    setVictim(player: Player): void {
        console.log("Insomnia doesn't have victim");
    }

}

export class Contamination implements WerewolfPower {

    private victim: Player;

    showPower(): void {
        console.log("Contamination options:");
    }

    usePower(): void {
        this.victim.contaminated();
    }

    setVictim(player: Player): void {
        this.victim = player;
    }

    isHumanPower(): Boolean {
        return false;
    }
    isWerewolfPower(): Boolean {
        return true;
    }

    getPowerValue(): number {
        return 1;
    }

}

export class Spiritism implements HumanPower, WerewolfPower {

    private victim: Player;

    showPower(): void {
        console.log("Spiritism options:");
    }

    usePower(): void {
        console.log("Contamine victim");
    }

    setVictim(player: Player): void {
        this.victim = player;
    }

    isHumanPower(): Boolean {
        return true;
    }
    isWerewolfPower(): Boolean {
        return true;
    }

    getPowerValue(): number {
        return 2;
    }

}

export class Clairvoyant implements HumanPower, WerewolfPower {

    private victim: Player;

    showPower(): void {
        console.log("clairvoyant options:");
    }

    usePower(): void {
        console.log("See victim's power");
    }

    setVictim(player: Player): void {
        this.victim = player;
    }

    isHumanPower(): Boolean {
        return true;
    }
    isWerewolfPower(): Boolean {
        return true;
    }
    getPowerValue(): number {
        return 3;
    }

}
