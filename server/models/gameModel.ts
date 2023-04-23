import { sql } from "kysely";
import database from "../util/database";
import { initGame } from "../controllers/gameStartedController";
import { Player } from "./playerModel";
import { Chat, Chat_type } from "./chatModel";
import { User } from "./userModel";
import { Villager, Werewolf } from "./villagerModel";
import { Event } from "../controllers/eventController";

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

    private static gamesList: Array<Game> = [];

    private gameId: number;
    private gameParam: GameParam;
    private playersList: Player[] = [];
    private chatslist: Array<Chat>;
    private currentNumberOfPlayer;

    /**
     * @param {number} gameId is the id of the game
     * @param {GameParam} gameParam parameters of the game
     */
    constructor(gameId: number, gameParam: GameParam) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.chatslist = [];
        this.currentNumberOfPlayer = 0;
    }

    /**
     * Charge une partie depuis la base de données
     * @param {number} gameId Id de la partie
     * @returns {Game}
     */
    static async load(gameId: number): Promise<Game> {
        const game: { id: number } & GameParam = await database
            .selectFrom("games")
            .select(["id", "nbPlayerMin", "nbPlayerMax", "dayLength", "nightLength", "startDate", "percentageWerewolf", "probaContamination", "probaInsomnie", "probaVoyance", "probaSpiritisme"])
            .where("id", "=", gameId)
            .executeTakeFirstOrThrow();
        const gameParams: GameParam = {
            nbPlayerMin: game.nbPlayerMin,
            nbPlayerMax: game.nbPlayerMax,
            dayLength: game.dayLength,
            nightLength: game.nightLength,
            startDate: game.startDate,
            percentageWerewolf: game.percentageWerewolf,
            probaContamination: game.probaContamination,
            probaInsomnie: game.probaInsomnie,
            probaVoyance: game.probaVoyance,
            probaSpiritisme: game.probaSpiritisme
        };

        return new Game(gameId, gameParams);
    }

    public static getAllGames(): Array<Game> {
        return Game.gamesList;
    }

    public static getGame = (gameId: number): Game => {
        const filter: Array<Game> = Game.gamesList.filter((game) => game.getGameId() === gameId);
        if (filter.length === 0) return null;
        return filter[0];
    };

    public static removeGame = (gameId: number): void => {
        for (let i = 0; i < Game.gamesList.length; i++) if (Game.gamesList[i].getGameId() === gameId) Game.gamesList.splice(i, 1);
    };

    public static addGameInList(game: Game): void {
        Game.gamesList.push(game);
    }

    /** Return Id of the game
     * @returns {number} Id of the game
     */
    public getGameId(): number {
        return this.gameId;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }

    public getChat(type: Chat_type): Chat {
        if (this.chatslist.length !== 3) return null;
        return this.chatslist[type];
    }

    /**
     * Initialisation des chats lors de la création d'une partie
     */
    public initChats(): void {
        this.chatslist.push(new Chat(Chat_type.CHAT_VILLAGE, this.playersList));
        this.chatslist.push(
            new Chat(
                Chat_type.CHAT_VILLAGE,
                this.playersList.filter((player) => player.getRole() instanceof Werewolf)
            )
        );
        this.chatslist.push(new Chat(Chat_type.CHAT_SPIRITISM, []));
    }

    /**
     * Mise à jour du chat du chaman
     * @param {Player} chaman Joueur ayant le pouvoir de spiritisme
     * @param {Player} deadPlayer Joueur mort qui échange avec lui la nuit
     * @returns {void}
     */
    public updateSpiritismChat(chaman: Player, deadPlayer: Player): void {
        if (this.chatslist.length !== 3) return;
        this.chatslist[2].resetChatMembers([chaman, deadPlayer]);
    }

    public getAllPlayers(): Array<Player> {
        return this.playersList;
    }

    public getAllPlayersId(): Array<number> {
        return this.playersList.map<number>((player) => player.getUser().getUserId());
    }

    public getPlayer(username: string): Player {
        for (const player of this.playersList) if (player.getUser().getUsername() === username) return player;
        return null;
    }

    public getNbOfPlayers(): number {
        return this.currentNumberOfPlayer;
    }

    public addPlayer(player: Player): void {
        this.playersList.push(player);
        this.currentNumberOfPlayer++;
    }
    public removePlayer(player: Player): void {
        for (let i = 0; i < this.playersList.length; i++) {
            if (this.playersList[i] == player) {
                this.playersList.splice(i, 1);
                this.currentNumberOfPlayer--;
            }
        }
    }

    public getGameRecap(): Record<string, any> {
        const idList: Array<number> = [];
        const idDeathList: Array<number> = [];

        for (const player of this.playersList) {
            idList.push(player.getUser().getUserId());
            if (player.isDeath()) idDeathList.push(player.getUser().getUserId());
        }
        return {
            status: this.getStatus(),
            idList: idList,
            deathPlayer: idDeathList
        };
    }

    /** Compute the status of the game
     * return an object of shape { status: number, timePassed: number }
     * status :
     *   -1 = not started, 0 = first day, 1 = first night, 2 = second days, ...
     * timePassed : Time passed since the start of the current day or night
     * @returns { JSON }
     */
    public getStatus(): { status: number; timePassed: number } {
        const timeSinceGameStart: number = Date.now() - this.gameParam.startDate;
        if (timeSinceGameStart < 0) {
            return { status: -1, timePassed: 0 };
        } else {
            const timeOfOneCycle = this.gameParam.dayLength + this.gameParam.nightLength;
            const numberOfCycle = Math.floor(timeSinceGameStart / timeOfOneCycle);
            const timeSinceCycleStart = timeSinceGameStart % timeOfOneCycle;
            // If we are day.
            if (timeSinceCycleStart - this.gameParam.nightLength <= 0) return { status: 1 + 2 * numberOfCycle, timePassed: timeSinceCycleStart };
            else return { status: 2 * (numberOfCycle + 1), timePassed: timeSinceCycleStart - this.gameParam.nightLength };
        }
    }

    /**
     * Function use to create a game table in the database if it is necessary
     * Next, load all game in the database and create an event to start a game at the starting date
     */
    public static schema = async (): Promise<void> => {
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
        const gamelist: Array<{ id: number } & GameParam> = await database
            .selectFrom("games")
            .select(["id", "nbPlayerMin", "nbPlayerMax", "dayLength", "nightLength", "startDate", "percentageWerewolf", "probaContamination", "probaInsomnie", "probaVoyance", "probaSpiritisme"])
            .execute();
        for (const elem of gamelist) {
            const gameParams: GameParam = {
                nbPlayerMin: elem.nbPlayerMin,
                nbPlayerMax: elem.nbPlayerMax,
                dayLength: elem.dayLength,
                nightLength: elem.nightLength,
                startDate: elem.startDate,
                percentageWerewolf: elem.percentageWerewolf,
                probaContamination: elem.probaContamination,
                probaInsomnie: elem.probaInsomnie,
                probaVoyance: elem.probaVoyance,
                probaSpiritisme: elem.probaSpiritisme
            };
            const game: Game = new Game(elem.id, gameParams);
            Game.addGameInList(game);
            // Si game pas commencé, on ajoute un evenement, Sinon on reprend la partie ou on en était.
            if (game.getStatus().status == -1) setTimeout(() => initGame(game.getGameId()), elem.startDate - Date.now());
            else initGame(game.getGameId());
        }

        // Initialisation des joueurs de chaque partie
        const players: Array<{ name: string; role: number; power: number; game: number }> = await database.selectFrom("players").select(["name", "role", "power", "game"]).execute();
        for (const elem of players) {
            const game: Game = Game.getGame(elem.game);
            const player: Player = new Player(User.getUser(elem.name), Villager.load(elem.role), elem.power, game);
            game.addPlayer(player);
        }
    };

}

// function gameRecapRequest(game: Game, user: User, data: Record<string, any>) {}

// Event.registerHandlers("GAME_RECAP_REQUEST", gameRecapRequest);
