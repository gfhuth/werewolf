import { Player } from "./playerModel";

export abstract class Power {

    public abstract showPower(): void;
    public abstract usePower(): void;

}

export interface WerewolfPower {
    usePower(): void;
}

export interface HumanPower {
    usePower(): void;
}

export class Insomnia extends Power implements HumanPower {

    showPower(): void {
        console.log("Insomnia options:");
    }

    usePower(): void {
        console.log("Observe Werewolf chat");
    }

}

export class Contamination extends Power implements WerewolfPower {

    private victim: Player;

    showPower(): void {
        console.log("Contamination options:");
    }

    usePower(): void {
        console.log("Contamine victim");
    }

    setVictim(player: Player): void {
        this.victim = player;
    }

}

export class Spiritism extends Power implements HumanPower, WerewolfPower {

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

}

export class Clairvoyant extends Power implements HumanPower, WerewolfPower {

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

}
