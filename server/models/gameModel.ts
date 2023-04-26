import { sql } from "kysely";
import database from "../util/database";
import { Player } from "./playerModel";
import { Chat, ChatType } from "./chatModel";
import { User } from "./userModel";
import { Human, Villager, Werewolf } from "./villagerModel";
import { Vote, VoteType } from "./voteModel";
import { Clairvoyant, Contamination, Insomnia, Spiritism } from "./powersModel";

export enum GameStatus {
    NOT_STARTED = -1,
    JOUR = 0,
    NUIT = 1,
}

export enum Role {
    VILLAGER,
    WEREWOLF,
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

function randfloat(a: number, b: number): number {
    return Math.random() * b + a;
}

export class Game {

    private static games: Map<number, Game> = new Map();
    private gameId: number;
    private gameParam: GameParam;
    private playersList: Map<string, Player> = new Map();
    private chatslist: Array<Chat>;
    private vote: Vote;
    private currentNumberOfPlayer;

    /**
     * @param {number} gameId is the id of the game
     * @param {GameParam} gameParam parameters of the game
     */
    constructor(gameId: number, gameParam: GameParam) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.chatslist = [];
        this.vote = null;
        this.currentNumberOfPlayer = 0;

        Game.addGameInList(this);

        // Si game pas commencé, on ajoute un evenement, Sinon on reprend la partie ou on en était.
        if (this.getStatus().status === GameStatus.NOT_STARTED) setTimeout(this.initGame.bind(this), this.gameParam.startDate - Date.now());
        else this.initGame();
    }

    /* ------------------ fonction logique de la partie ------------------ */

    /**
     * Initialisation des chats lors de la création d'une partie
     */
    public initChats(): void {
        this.chatslist.push(new Chat(ChatType.CHAT_VILLAGE, this.getAllPlayers()));
        this.chatslist.push(new Chat(ChatType.CHAT_WEREWOLF, this.getWerewolfs()));
        this.chatslist.push(new Chat(ChatType.CHAT_SPIRITISM, []));
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

    public addPlayer(player: Player): void {
        this.playersList.set(player.getUser().getUsername(), player);
        this.currentNumberOfPlayer++;
    }
    public removePlayer(username: string): void {
        this.playersList.delete(username);
    }

    /** Set all role in the game
     * @param {Game} game Game with all player added
     */
    setupGamePowerAndRole(): void {
        const gameParam = this.getGameParam();
        const players = this.getAllPlayers();

        const powersWerewolf = [];
        const powersHuman = [];
        // On choisi si on utilise les pouvoirs
        if (randfloat(0, 1) <= gameParam.probaContamination) powersWerewolf.push(new Contamination());
        if (randfloat(0, 1) <= gameParam.probaInsomnie) powersHuman.push(new Insomnia());
        if (randfloat(0, 1) <= gameParam.probaSpiritisme) {
            if (randfloat(0, 1) <= gameParam.percentageWerewolf) powersWerewolf.push(new Spiritism());
            else powersHuman.push(new Spiritism());
        }
        if (randfloat(0, 1) <= gameParam.probaVoyance) {
            if (randfloat(0, 1) <= gameParam.percentageWerewolf) powersWerewolf.push(new Clairvoyant());
            else powersHuman.push(new Clairvoyant());
        }
        Player.shuffle(players);
        let i;
        // attribution des roles loups garous et des pouvoirs loups garous
        for (i = 0; i < Math.floor(gameParam.percentageWerewolf * this.getAllPlayers().length); i++) {
            players[i].setRole(new Werewolf());
            if (i < powersWerewolf.length) players[i].getRole().setPower(powersWerewolf[i]);
        }
        const startIndex = i;

        // attribution des roles humains et des pouvoir humains
        for (i = startIndex; i < this.getAllPlayers().length; i++) {
            players[i].setRole(new Human());
            if (i - startIndex < powersHuman.length) players[i].getRole().setPower(powersHuman[i]);
        }
    }

    /** Apply all action happend during the night and lunch a day
     */
    startDay(): void {
        console.log(`The sun is rising, status : ${this.getStatus().status} for game :${this.getGameId()}`);
        // Réinitialisation du chat
        this.getChat(ChatType.CHAT_VILLAGE).resetMessages();
        this.getChat(ChatType.CHAT_SPIRITISM).resetChatMembers([]);
        // Initialisation du vote
        this.setVote(new Vote(VoteType.VOTE_VILLAGE, this.getAllPlayers()));
        //Envoie a chaque joueur un nouveau game recap
        for (const player of this.getAllPlayers()) player.sendNewGameRecap();
        // TODO: Update table player
        this.lunchNextGameMoment();
    }
    /** lunch a night
     */
    startNight(): void {
        console.log(`The night is falling, status : ${this.getStatus().status} for game :${this.getGameId()}`);
        // Réinitialisation des chats
        this.getChat(ChatType.CHAT_WEREWOLF).resetMessages();
        this.getChat(ChatType.CHAT_SPIRITISM).resetMessages();
        // Initialisation du vote
        this.setVote(new Vote(VoteType.VOTE_WEREWOLF, this.getWerewolfs()));
        //Envoie a chaque joueur un nouveau game recap
        for (const player of this.getAllPlayers()) player.sendNewGameRecap();
        // TODO: Update table player
        // call startDay at the end of the day
        this.lunchNextGameMoment();
    }

    private lunchNextGameMoment(): void {
        let func;
        if (this.getStatus().status % 2 === GameStatus.JOUR) func = this.startDay;
        else func = this.startNight;
        setTimeout(func, this.gameParam.dayLength);
    }

    /** Function to add when a game is restored or start
     * Setup the game (probability, role, ...)
     * Add event call at each end of days (use interval or timeout), ...
     * @param {number} gameId id of the starting game
     * */
    public async initGame(): Promise<void> {
        console.log(`Initialisation de la partie : ${this.gameId}`);
        // if (this.getGameParam().nbPlayerMin > this.getNbOfPlayers()) {
        //     Game.removeGame(this.getGameId());
        //     await database.deleteFrom("games").where("games.id", "=", this.getGameId()).executeTakeFirst();
        //     this.getAllPlayers().forEach((player) => player.sendMessage("GAME_DELETED", { message: "game deleted" }));
        //     console.log("Suppresions de la partie");
        //     return;
        // }
        console.log(`Initialisation des chats : ${this.gameId}`);
        // Initialisation des chats
        this.initChats();
        //Initialisation des roles et des pouvoirs
        const gameStatus = this.getStatus();
        if (gameStatus.status === GameStatus.JOUR) this.setupGamePowerAndRole();
        // Lancement du jours ou de la nuit selon la date actuel
        this.lunchNextGameMoment();
        console.log(`game ${this.gameId} successfuly initialized`);
    }
    /* ------------------ Getter et Setter ------------------ */

    /** Return Id of the game
     * @returns {number} Id of the game
     */
    public getGameId(): number {
        return this.gameId;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }

    public getVote(): Vote {
        return this.vote;
    }

    public setVote(vote: Vote): void {
        this.vote = vote;
    }

    public getChat(type: ChatType): Chat {
        if (this.chatslist.length !== 3) return null;
        return this.chatslist[type];
    }
    public getAllPlayers(): Array<Player> {
        return Array.from(this.playersList.values());
    }

    public getPlayer(username: string): Player {
        return this.playersList.get(username);
    }

    public getNbOfPlayers(): number {
        return this.currentNumberOfPlayer;
    }

    public getWerewolfs(): Array<Player> {
        return this.getAllPlayers().filter((player: Player) => player.getRole() instanceof Werewolf);
    }

    public getGameRecap(): Record<string, any> {
        const usernameList: Array<string> = [];
        const usernameDeathList: Array<string> = [];
        const iterator = this.playersList.values();
        for (let player = iterator.next(); !player.done; player = iterator.next()) {
            usernameList.push(player.value.getUser().getUsername());
            if (player.value.isDeath()) usernameDeathList.push(player.value.getUser().getUsername());
        }
        return {
            status: this.getStatus(),
            playerInGame: usernameList,
            deathPlayer: usernameDeathList
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

    /* ------------------ Static Function ------------------ */
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

    public static getAllGames(): IterableIterator<Game> {
        return Game.games.values();
    }

    public static removeGame = (gameId: number): void => {
        Game.games.delete(gameId);
    };

    public static addGameInList(game: Game): void {
        Game.games.set(game.getGameId(), game);
    }

    public static getGame = (gameId: number): Game => {
        const game = Game.games.get(gameId);
        return game;
    };

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
    };

    public static async loadAllGame(): Promise<void> {
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
        }

        // Initialisation des joueurs de chaque partie
        const players: Array<{ name: string; role: number; power: number; game: number }> = await database.selectFrom("players").select(["name", "role", "power", "game"]).execute();
        for (const elem of players) {
            const game: Game = Game.getGame(elem.game);
            const player: Player = new Player(User.getUser(elem.name), Villager.load(elem.role), elem.power, game);
            game.addPlayer(player);
        }
        console.log("Chargment des parties deja créer terminé");
    }

}
