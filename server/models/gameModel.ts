import { sql } from "kysely";
import database from "../util/database";
import { initGame } from "../controllers/gameStartedController";
import { Player } from "./playerModel";
import { User } from "./userModel";

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

/** class Game
 * represente a game
 * usefield
 *  currentNumberOfPlayer current number of player who have join the game
 * fonction
 *  getGameId()         return the id of this game
 *  getGameParam()      return the GameParam object of this game
 *  toShortJson()       return a json with the minimum information
 *  toLongJson()        return json of this object
 *  gameDBtoGame(game)  convert a game given by the database in Game object
 *  getStatus()         Return an number corresponding to the status of the game
 */
export class Game {

    private gameId: number;
    private gameParam: GameParam;
    private playerList: Player[] = [];
    private host: User;
    public currentNumberOfPlayer = 1;

    /**
     * @param {number} gameId is the id of the game
     * @param {GameParam} gameParam parameter of the game
     * @param {User} host user who create the game
     */
    constructor(gameId: number, gameParam: GameParam, host: User) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.host = host;
    }

    /** Return Id of the game
     * @returns {number} Id of the game
     */
    public getGameId(): number {
        return this.gameId;
    }

    /** Give the GameParam object of this game
     * @returns {number} parameter of the game
     */
    public getGameParam(): GameParam {
        return this.gameParam;
    }

    /** Give a short json to semarize a games
     * @returns {JSON} json return
     */
    public toShortJson(): { [key: string]: string | number } {
        const id = this.gameId;
        const startDate = this.gameParam.startDate;
        const host = this.host;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const nbPlayerMax = this.gameParam.nbPlayerMax;
        return {
            id: id,
            startDate: startDate.toLocaleString(),
            hostId: host.getUserId(),
            currentNumberOfPlayer: currentNumberOfPlayer,
            nbPlayerMax: nbPlayerMax
        };
    }

    /** Give a json of all information on a game
     * @returns {JSON} all information of the game
     */
    public toLongJson(): { [key: string]: string | number } {
        const gameParam = this.gameParam;
        const host = this.host;
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
            hostId: host.getUserId(),
            currentNumberOfPlayer: currentNumberOfPlayer,
            wereWolfCount: wereWolfCount
        };
    }

    /**
     * Convert a game from the database in object Game
     * @param {Object} data object given by a request as "db.selectFrom("games").selectAll()"
     * @returns {Game} a new game create from the given data
     */
    public static gameDBtoGame(data): Game {
        const gameParam: GameParam = {
            nbPlayerMin: data.nbPlayerMin,
            nbPlayerMax: data.nbPlayerMax,
            dayLength: data.dayLength,
            nightLength: data.nightLength,
            startDate: data.startDate,
            percentageWerewolf: data.percentageWerewolf,
            probaContamination: data.probaContamination,
            probaInsomnie: data.probaInsomnie,
            probaVoyance: data.probaVoyance,
            probaSpiritisme: data.probaSpiritisme
        };

        const game = new Game(Number(data.id), gameParam, data.hostId);
        game.currentNumberOfPlayer = data.currentNumberOfPlayer;
        return game;
    }

    /** Compute the status of the game
     * Odd number corresponding to a night. Other are days.
     * 0 = not started, 1 = first day, 2 = first night
     * @returns {number} 
     */
    public getStatus(): number {
        // time in ms
        const time = Date.now() - this.gameParam.startDate;
        const timeInHour = time / 3600000;
        if (time < 0) return GameStatus.NOT_STARTED;
        else return Math.floor(timeInHour / (this.gameParam.dayLength + this.gameParam.nightLength));
    }

}

/**
 * Function use to create a game table in the database if it is necessary
 * Next, load all game in the database and create an event to start a game at the starting date
 */
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
        if (game.getStatus() != 0) setTimeout(() => initGame(game.getGameId()), game.getGameParam().startDate - Date.now());
    }
};
