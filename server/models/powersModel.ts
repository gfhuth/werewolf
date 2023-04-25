/* eslint-disable @typescript-eslint/no-empty-interface */
import { Player } from "./playerModel";

export abstract class Power {

    private powerAlreadyUsed: boolean;

    public getPowerAlreadyUsed(): boolean {
        return this.powerAlreadyUsed;
    }

    public abstract usePower(): Record<string, any>;
    public getPowerValue(): number {
        return -1;
    }
    public abstract isHumanPower(): Boolean;
    public abstract isWerewolfPower(): Boolean;
    public abstract setVictim(player: Player): void;

}

export interface HumanPower extends Power{}

export interface WerewolfPower extends Power{}

export class Insomnia extends Power implements HumanPower {

    usePower(): Record<string, any> {
        console.log("Observe Werewolf chat");
        return {};
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

export class Contamination extends Power implements WerewolfPower {

    private victim: Player;

    usePower(): Record<string, any> {
        this.victim.contaminated();
        return {};
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

export class Spiritism extends Power implements HumanPower, WerewolfPower {

    private victim: Player;

    usePower(): Record<string, any> {
        console.log("Contamine victim");
        return {};
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

export class Clairvoyant extends Power implements HumanPower, WerewolfPower {

    private victim: Player;

    usePower(): Record<string, any> {
        const victimRole = this.victim.getRole();
        const victimPower = victimRole.getPower();

        return { Player: this.victim.getUser().getUsername(), Villager: victimRole.getRoleValue(), Power: victimPower.getPowerValue() };
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
