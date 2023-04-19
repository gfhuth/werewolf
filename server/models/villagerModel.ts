import { Chat } from "./chatModel.js";
import { HumanPower, WerewolfPower } from "./powersModel.js";

export abstract class Villager {

    public abstract getRoleValue(): number;

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

}
