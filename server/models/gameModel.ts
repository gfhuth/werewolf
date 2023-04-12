import { sql } from "kysely";
import database from "../util/database";
import { startGame } from "../controllers/gameStartedController";

export const gamesList: Array<Game> = [];
export enum GameStatus {
    NOT_STARTED = 0,
    JOUR = 1,
    NUIT = 2,
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
    private hostId: number;
    public currentNumberOfPlayer = 1;

    constructor(gameId: number, gameParam: GameParam, hostName: number) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.hostId = hostName;
    }

    getGameId(): number {
        return this.gameId;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }
    //return json with : id, startDate, hostName, currentNumberOfPlayer, nbPlayerMax
    public toShortJson(): { [key: string]: string | number } {
        const id = this.gameId;
        const startDate = this.gameParam.startDate;
        const hostId = this.hostId;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const nbPlayerMax = this.gameParam.nbPlayerMax;
        return {
            id: id,
            startDate: startDate.toLocaleString(),
            hostId: hostId,
            currentNumberOfPlayer: currentNumberOfPlayer,
            nbPlayerMax: nbPlayerMax
        };
    }

    //return json of this object
    public toLongJson(): { [key: string]: string | number } {
        const gameParam = this.gameParam;
        const hostId = this.hostId;
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
            hostId: hostId,
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

        const game = new Game(Number(row.id), gameParam, row.hostId);
        game.currentNumberOfPlayer = row.currentNumberOfPlayer;
        return game;
    }

    public getStatus(): number {
        // time in ms
        const time = Date.now() - this.gameParam.startDate;
        if (time < 0) return GameStatus.NOT_STARTED;
        else return 1 + (Math.floor(time / 3600000 / (this.gameParam.dayLength + this.gameParam.nightLength)) % 2);
    }

}
export const gameInProgress = [];

export const gameSchema = async (): Promise<void> => {
    await database.schema
        .createTable("games")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("hostId", "integer", (col) => col.notNull())
        //TODO add statuts needed for the game (for example : isNight, idPersonAlives,...)
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

    // On charge chaque parties en cours
    const gamelist = await database.selectFrom("games").selectAll().execute();
    for (let i = 0; i < gamelist.length; i++) {
        const game = Game.gameDBtoGame(gamelist[i]);
        if (game.getStatus() != 0) setTimeout(() => startGame(game.getGameId()), game.getGameParam().startDate - Date.now());
    }
};
