import { Player } from "./playerModel";

export interface HumanPower {

    showPower(): void;
    usePower(): void;

}

export interface WerewolfPower {

    showPower(): void;
    usePower(): void;

}

class Insomnia implements HumanPower {


    showPower(): void {
        console.log("Insomnia options:");
    }

    usePower(): void {
        console.log("Observe Werewolf chat");
    }

}

class Contamination implements WerewolfPower {

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

class Spiritism implements HumanPower, WerewolfPower {

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

class Clairvoyant implements WerewolfPower {

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
