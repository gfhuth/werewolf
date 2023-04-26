import { HumanPower, Power, WerewolfPower } from "./powersModel.js";

export abstract class Villager {

    public abstract getRoleValue(): number;
    public abstract setPower(power: Power): void;
    public abstract getPower(): Power;
    public static load(type: number): Villager {
        if (type === 0)
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Human();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        else return new Werewolf();
    }

}

export class Human extends Villager {

    protected power: HumanPower;

    constructor() {
        super();
        this.power = null;
    }

    public getRoleValue(): number {
        return 0;
    }

    public setPower(power: Power): void {
        if (power.isHumanPower()) {
            this.power = power;
            return;
        }
        throw new Error("A werewolf power is given but a Human power is required.");
    }
    public getPower(): Power {
        return this.power;
    }

}

export class Werewolf extends Villager {

    protected power: WerewolfPower;

    constructor() {
        super();
        this.power = null;
    }

    public getRoleValue(): number {
        return 1;
    }

    public setPower(power: Power): void {
        if (power.isWerewolfPower()) this.power = power;

        throw new Error("A Human power is given but a Werewolf power is required.");
    }
    public getPower(): Power {
        return this.power;
    }

}
