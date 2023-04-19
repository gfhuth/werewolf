import { Player } from "./playerModel";

export abstract class Power {

    public abstract showPower(): void;
    public abstract usePower(): void;

    public abstract isHumanPower():Boolean;
    public abstract isWerewolfPower():Boolean;

}

export interface HumanPower extends Power{

}

export interface WerewolfPower extends Power{

}

export class Insomnia implements HumanPower {

    showPower(): void {
        console.log("Insomnia options:");
    }

    usePower(): void {
        console.log("Observe Werewolf chat");
    }

    isHumanPower():Boolean { return true;}
    isWerewolfPower():Boolean { return false;}
}

export class Contamination implements WerewolfPower {

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

    isHumanPower():Boolean { return false;}
    isWerewolfPower():Boolean { return true;}
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
    
    isHumanPower():Boolean { return true;}
    isWerewolfPower():Boolean { return true;}
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

    isHumanPower():Boolean { return true;}
    isWerewolfPower():Boolean { return true;}
}
