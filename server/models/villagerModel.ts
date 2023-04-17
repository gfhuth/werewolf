import { Chat } from "./chatModel.js";
import { HumanPower, Power, WerewolfPower } from "./powersModel.js";

export abstract class Villager {

    protected chatHuman: Chat;
    protected chatWerewolf: Chat;
    protected chatSpirit: Chat;
    protected power: Power;

    setChatSpirit(chat: Chat): void {
        this.chatSpirit = chat;
    }

    public abstract getRoleValue(): number;

    public getPower(): Power {
        return this.power;
    }
    public setPower(power: Power): void {
        this.power = power;
    }

    public static load(type: number): Villager {
        if (type == 0)
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Human(null, null);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        else return new Werewolf(null, null, null);
    }

}

export class Human extends Villager {


    constructor(chatHuman: Chat, power: HumanPower) {
        super();
        this.chatHuman = chatHuman;
        this.setPower(power);
    }

    public getRoleValue(): number {
        return 0;
    }

}

export class Werewolf extends Villager {

    protected power: WerewolfPower;

    constructor(chatHuman: Chat, chatWerewolf: Chat, power: WerewolfPower) {
        super();
        this.chatHuman = chatHuman;
        this.chatWerewolf = chatWerewolf;
        this.power = power;
    }
    public getRoleValue(): number {
        return 1;
    }

}
