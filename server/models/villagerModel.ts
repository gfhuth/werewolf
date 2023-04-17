import { Chat } from "./chatModel.js";
import { HumanPower, WerewolfPower } from "./powersModel.js";

export abstract class Villager {

    protected chatHuman: Chat;
    protected chatWerewolf: Chat;
    protected chatSpirit: Chat;

    setChatSpirit(chat: Chat): void {
        this.chatSpirit = chat;
    }

    public abstract getRoleValue(): number;

    public static load(type: number): Villager {
        if (type == 0) 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Human(null, null);
        else 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new Werewolf(null, null, null);
    }

}

export class Human extends Villager {

    protected power: HumanPower;

    constructor(chatHuman: Chat, power: HumanPower) {
        super();
        this.chatHuman = chatHuman;
        this.power = power;
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
