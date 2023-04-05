import { sql } from "kysely";
import database from "../util/database";
import { GameTable } from "../util/sql/schema";

export enum GameStatus {
    stated = 1,
    notStated = 0,
}

export type GameParam = {
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
};

export class Game {

    private gameId: number;
    private gameParam: GameParam;
    private hostName: string;
    private gameStatus: GameStatus;
    public currentNumberOfPlayer = 1;

    constructor(gameId: number, gameParam: GameParam, hostName: string, gameStatus: GameStatus) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.hostName = hostName;
        this.gameStatus = gameStatus;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }
    //return json with : id, startDate, hostName, currentNumberOfPlayer, nbPlayerMax
    public toShortJson(): { [key: string]: string | number } {
        const id = this.gameId;
        const startDate = this.gameParam.startDate;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const nbPlayerMax = this.gameParam.nbPlayerMax;
        return {
            id: id,
            startDate: startDate.toLocaleString(),
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            nbPlayerMax: nbPlayerMax
        };
    }

    //return json of this object
    public toLongJson(): { [key: string]: string | number } {
        const gameParam = this.gameParam;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const wereWolfCount = Math.floor((gameParam.nbPlayerMax * gameParam.percentageWerewolf) / 100);

        return {
            id: this.gameId,
            nbPlayerMax: gameParam.nbPlayerMax,
            dayLenght: gameParam.dayLength,
            nightLength: gameParam.nightLength,
            startDate: gameParam.startDate.toString(),
            percentageWerewolf: gameParam.percentageWerewolf,
            probaContamination: gameParam.probaContamination,
            probaInsomnie: gameParam.probaInsomnie,
            probaVoyance: gameParam.probaVoyance,
            probaSpiritisme: gameParam.probaSpiritisme,
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            wereWolfCount: wereWolfCount
        };
    }

    public static gameDBtoGame(row): Game {
        const gameParam: GameParam = {
            nbPlayerMin: row.nbPlayerMin,
            nbPlayerMax: row.nbPlayerMax,
            dayLength: row.dayLength,
            nightLength: row.nightLength,
            startDate: row.startDate,
            percentageWerewolf: row.percentageWerewolf,
            probaContamination: row.probaContamination,
            probaInsomnie: row.probaInsomnie,
            probaVoyance: row.probaVoyance,
            probaSpiritisme: row.probaSpiritisme
        };

        const game = new Game(Number(row.id), gameParam, row.hostname, Number(row.status));
        game.currentNumberOfPlayer = row.currentNumberOfPlayer;
        return game;
    }

}

export const gameSchema = async (): Promise<void> => {
    await database.schema
        .createTable("games")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("hostname", "text", (col) => col.notNull())
        //TODO add statuts needed for the game (for example : isNight, idPersonAlives,...)
        .addColumn("status", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("currentNumberOfPlayer", "integer", (col) => col.defaultTo(1).notNull())
        //param of type gameParam
        .addColumn("nbPlayerMin", "integer", (col) => col.defaultTo(5).notNull())
        .addColumn("nbPlayerMax", "integer", (col) => col.defaultTo(20).notNull())
        .addColumn("dayLength", "integer", (col) => col.defaultTo(10).notNull())
        .addColumn("nightLength", "integer", (col) => col.defaultTo(12).notNull())
        .addColumn("startDate", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn("percentageWerewolf", "real", (col) => col.defaultTo(0.33).notNull())
        .addColumn("probaContamination", "real", (col) => col.defaultTo(0).notNull())
        .addColumn("probaInsomnie", "real", (col) => col.defaultTo(0).notNull())
        .addColumn("probaVoyance", "real", (col) => col.defaultTo(0).notNull())
        .addColumn("probaSpiritisme", "real", (col) => col.defaultTo(0).notNull())
        .execute();
    // add example game for test
    await database
        .insertInto("games")
        .values({
            hostname: "admin",
            status: 0,
            currentNumberOfPlayer: 1,
            nbPlayerMin: 5,
            nbPlayerMax: 20,
            dayLength: 12,
            nightLength: 12,
            startDate: Date.now(),
            percentageWerewolf: 0.5,
            probaContamination: 0.5,
            probaInsomnie: 0.5,
            probaVoyance: 0.5,
            probaSpiritisme: 0.5
        })
        .execute();
};
