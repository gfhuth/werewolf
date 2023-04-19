import { throws } from "assert";
import { Chat } from "./chatModel.js";
import { HumanPower, Power, WerewolfPower } from "./powersModel.js";

export abstract class Villager {

    public abstract getRoleValue(): number;
    public abstract setPower(power:Power):void;
    
    public static load(type: number): Villager {
        if (type == 0) 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Human(null);
        else 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Werewolf(null);
    }

}

export class Human extends Villager {

    protected power: HumanPower;

    constructor(power: HumanPower) {
        super();
        this.power = power;
    }

    public getRoleValue(): number {
        return 0;
    }

    public setPower(power:Power):void{
        if (power.isHumanPower()){
            this.power = power;
        }
        throw new Error("A werewolf power is given but a Human power is required.");
    }
}

export class Werewolf extends Villager {

    protected power: WerewolfPower;

    constructor(power: WerewolfPower) {
        super();
        this.power = power;
    }

    public getRoleValue(): number {
        return 1;
    }

    public setPower(power:Power):void{
        if (power.isWerewolfPower()){
            this.power = power;
        }
        throw new Error("A Human power is given but a Werewolf power is required.");
    }

}
