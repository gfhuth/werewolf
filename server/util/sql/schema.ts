import { Generated } from "kysely";

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
    id: Generated<number>;
    game: number;
    chat: number,
    user: number;
    content: string;
    date: number;
}

export interface Database {
    users: UserTable;
    players: PlayerTable;
    games: GameTable;
    messages: MessageTable
}
