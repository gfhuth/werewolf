import { Chat } from "./chatModel.js";
import { HumanPower, WerewolfPower } from "./powersModel.js";

abstract class Villager {

    protected chatHuman: Chat;
    protected chatWerewolf: Chat;
    protected chatSpirit: Chat;

    setChatSpirit(chat: Chat) : void {
        this.chatSpirit = chat;
    }

}

class Human extends Villager {

    protected power: HumanPower;
    
    constructor(chatHuman: Chat, power: HumanPower) {
        super();
        this.chatHuman = chatHuman;
        this.power = power;
    }

}

class Werewolf extends Villager {

    protected power: WerewolfPower;
    
    constructor(chatHuman: Chat, chatWerewolf: Chat, power: WerewolfPower) {
        super();
        this.chatHuman = chatHuman;
        this.chatWerewolf = chatWerewolf;
        this.power = power;
    }

}

class Dead extends Villager {
    
    constructor(chatHuman: Chat, chatWerewolf: Chat, chatSpirit: Chat) {
        super();
        this.chatHuman = chatHuman;
        this.chatWerewolf = chatWerewolf;
        this.chatSpirit = chatSpirit;
    }

}
