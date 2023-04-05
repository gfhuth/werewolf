import { Generated } from "kysely";
import { Chat } from "../../models/Chat";

export interface UserTable {
    id: Generated<number>;
    username: string;
    password: string;
}

export interface PlayerTable {
    id: Generated<number>;
    name: string;
    role: string;
    power: string;
    user: number;
    game: number;
}

export interface GameTable {
    id: Generated<number>;
    hostname: string;
    status: number;
    currentNumberOfPlayer: number;
    nbPlayerMin: number;
    nbPlayerMax: number;
    dayLength: number;
    nightLength: number;
    startDate: number;
    percentageWerewolf: number;
    probaContamination: number;
    probaInsomnie: number;
    probaVoyance: number;
    probaSpiritisme: number;
}

export interface MessageTable {
    idMsg: number;
    idChat: number;
    idSender: number;
    text: string;
    time: number;
}

export interface Database {
    users: UserTable;
    players: PlayerTable;
    games: GameTable;
    messages: MessageTable
}
