import { sql } from "kysely";
import database from "../util/database";

export type GameParam = {
    id: number;
    maxNbPlayer: number;
    dayLenght: number;
    nightLenght: number;
    startDate: Date;
    percentWereWolf: number;
    proba: { contamination: number; insomnie: number; voyance: number; spiritisme: number };
};

export class Game {

    private gameParam: GameParam;
    private hostName: string;
    private currentNumberOfPlayer = 1;

    constructor(gameParam: GameParam, hostName: string) {
        this.gameParam = gameParam;
        this.hostName = hostName;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }
    //return json with : id, startDate, hostName, currentNumberOfPlayer, maxNbPlayer
    public toShortJson(): { [key: string]: string | number } {
        const id = this.gameParam.id;
        const startDate = this.gameParam.startDate;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const maxNbPlayer = this.gameParam.maxNbPlayer;
        return {
            id: id,
            startDate: startDate.toLocaleString(),
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            maxNbPlayer: maxNbPlayer
        };
    }

    //return json of this object
    public toLongJson(): { [key: string]: string | number } {
        const gameParam = this.gameParam;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const wereWolfCount = Math.floor((gameParam.maxNbPlayer * gameParam.percentWereWolf) / 100);

        return {
            id: gameParam.id,
            maxNbPlayer: gameParam.maxNbPlayer,
            dayLenght: gameParam.dayLenght,
            nightLenght: gameParam.nightLenght,
            startDate: gameParam.startDate.toISOString(),
            percentWereWolf: gameParam.percentWereWolf,
            //proba: gameParam.proba,
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            wereWolfCount: wereWolfCount
        };
    }

}


export const gameSchema = async (): Promise<void> => {
    await database.schema
        .createTable("games")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("nbPlayerMin", "integer", (col) => col.defaultTo(5).notNull())
        .addColumn("nbPlayerMax", "integer", (col) => col.defaultTo(20).notNull())
        .addColumn("dayLength", "integer", (col) => col.defaultTo(10).notNull())
        .addColumn("nightLength", "integer", (col) => col.defaultTo(12).notNull())
        .addColumn("startDate", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn("percentageWerewolf", "integer", (col) => col.defaultTo(0.33).notNull())
        .addColumn("probaContamination", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaInsomnie", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaVoyance", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaSpiritisme", "integer", (col) => col.defaultTo(0).notNull())
        .execute();
};

export type GameObject = {
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

export const createGame = async (game: GameObject): Promise<void> => {
    await database.insertInto("games").values(game).execute();
};
