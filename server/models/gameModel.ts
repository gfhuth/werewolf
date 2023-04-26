import { sql } from "kysely";
import database from "../util/database";
import { Player } from "./playerModel";
import { Chat, ChatType } from "./chatModel";
import { Vote, VoteType } from "./voteModel";
import Logger from "../util/Logger";
import ContaminationPower from "./powers/ContaminationPower";
import InsomniaPower from "./powers/InsomniaPower";
import SpiritismPower from "./powers/SpiritismPower";
import ClairvoyancePower from "./powers/ClairvoyancePower";
import { toBoolean } from "../util/sql/schema";

const LOGGER = new Logger("GAME");

export enum GameStatus {
    NOT_STARTED = -1,
    NIGHT = 0,
    DAY = 1,
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

export class Game {

    private static games: Map<number, Game> = new Map();

    private gameId: number;
    private gameParam: GameParam;
    private players: Map<string, Player> = new Map();
    private chats: Array<Chat>;
    private currentVote: Vote;

    /**
     * @param {number} gameId is the id of the game
     * @param {GameParam} gameParam parameters of the game
     */
    constructor(gameId: number, gameParam: GameParam) {
        this.gameId = gameId;
        this.gameParam = gameParam;
        this.chats = [];
        this.currentVote = null;

        Game.addGameInList(this);

        // Si game pas commencé, on ajoute un evenement, Sinon on reprend la partie ou on en était.
        if (this.getStatus() === GameStatus.NOT_STARTED) setTimeout(this.initGame.bind(this), this.gameParam.startDate - Date.now());
        else this.initGame();
    }

    /* ------------------ fonction logique de la partie ------------------ */

    /**
     * Initialisation des chats lors de la création d'une partie
     */
    public initChats(): void {
        this.chats.push(new Chat(ChatType.CHAT_VILLAGE, this.getAllPlayers()));
        this.chats.push(new Chat(ChatType.CHAT_WEREWOLF, this.getWerewolfs()));
        this.chats.push(new Chat(ChatType.CHAT_SPIRITISM, []));
    }
    /**
     * Mise à jour du chat du chaman
     * @param {Player} chaman Joueur ayant le pouvoir de spiritisme
     * @param {Player} deadPlayer Joueur mort qui échange avec lui la nuit
     * @returns {void}
     */
    public updateSpiritismChat(chaman: Player, deadPlayer: Player): void {
        if (this.chats.length !== 3) return;
        this.chats[2].resetChatMembers([chaman, deadPlayer]);
    }

    public addPlayer(player: Player): void {
        this.players.set(player.getUser().getUsername(), player);
    }
    public removePlayer(username: string): void {
        this.players.delete(username);
    }

    private setupRoles(): void {
        const nbWerewolfs: number = Math.max(1, Math.ceil(this.gameParam.percentageWerewolf * this.getAllPlayers().length));
        const players: Array<Player> = this.getAllPlayers();
        const werewolfs: Array<Player> = [];
        while (werewolfs.length < nbWerewolfs) {
            const werewolf: Player = players[Math.floor(Math.random() * players.length)];
            werewolf.setWerewolf(true);
            werewolf.sendMessage("SET_ROLE", { role: Role.WEREWOLF, nbWerewolfs: nbWerewolfs });
            werewolfs.push(werewolf);
            players.splice(players.indexOf(werewolf), 1);
        }
        players.forEach((player) => {
            player.setWerewolf(false);
            player.sendMessage("SET_ROLE", { role: Role.VILLAGER, nbWerewolfs: nbWerewolfs });
        });
    }

    private setupPower(): void {
        const werewolfs: Array<Player> = this.getWerewolfs();
        const humans: Array<Player> = this.getAllPlayers().filter((player) => !player.isWerewolf());

        if (Math.random() <= this.gameParam.probaContamination) {
            const contamination: Player = werewolfs[Math.floor(Math.random() * werewolfs.length)];
            contamination.setPower(new ContaminationPower());
            contamination.sendMessage("SET_POWER", { power: contamination.getPower().getName() });
        }
        if (Math.random() <= this.gameParam.probaInsomnie) {
            const insomnie: Player = humans[Math.floor(Math.random() * humans.length)];
            insomnie.setPower(new InsomniaPower());
            insomnie.sendMessage("SET_POWER", { power: insomnie.getPower().getName() });
        }

        let playersWithoutPower: Array<Player> = this.getAllPlayers().filter((player) => !player.getPower());
        if (Math.random() <= this.gameParam.probaSpiritisme) {
            const spiritisme: Player = playersWithoutPower[Math.floor(Math.random() * playersWithoutPower.length)];
            spiritisme.setPower(new SpiritismPower());
            spiritisme.sendMessage("SET_POWER", { power: spiritisme.getPower().getName() });
        }

        playersWithoutPower = playersWithoutPower.filter((player) => !player.getPower());
        if (Math.random() <= this.gameParam.probaVoyance) {
            const voyance: Player = playersWithoutPower[Math.floor(Math.random() * playersWithoutPower.length)];
            voyance.setPower(new ClairvoyancePower());
            voyance.sendMessage("SET_POWER", { power: voyance.getPower().getName() });
        }
    }

    /** Apply all action happend during the night and lunch a day
     */
    startDay(): void {
        console.log(`The sun is rising, status : ${this.getStatus()} for game : ${this.getGameId()}`);
        // Réinitialisation du chat
        this.getChat(ChatType.CHAT_VILLAGE).resetMessages();
        this.getChat(ChatType.CHAT_SPIRITISM).resetChatMembers([]);
        // Initialisation du vote
        this.setVote(new Vote(VoteType.VOTE_VILLAGE, this.getAllPlayers()));
        //Envoie a chaque joueur un nouveau game recap
        // TODO : Envoyer l'info de passage au jour au joueur
        // for (const player of this.getAllPlayers()) player.sendNewGameRecap();
        // TODO: Update table player
        this.lunchNextGameMoment();
    }
    /** lunch a night
     */
    startNight(): void {
        console.log(`The night is falling, status : ${this.getStatus()} for game : ${this.getGameId()}`);
        // Réinitialisation des chats
        this.getChat(ChatType.CHAT_WEREWOLF).resetMessages();
        this.getChat(ChatType.CHAT_SPIRITISM).resetMessages();
        // Initialisation du vote
        this.setVote(new Vote(VoteType.VOTE_WEREWOLF, this.getWerewolfs()));
        //Envoie a chaque joueur un nouveau game recap
        // TODO : Envoyer l'info de passage à la nuit au joueur
        // for (const player of this.getAllPlayers()) player.sendNewGameRecap();
        // TODO: Update table player
        // call startDay at the end of the day
        this.lunchNextGameMoment();
    }

    private lunchNextGameMoment(): void {
        if (this.getStatus() === GameStatus.DAY) setTimeout(this.startNight.bind(this), this.gameParam.dayLength);
        else setTimeout(this.startDay.bind(this), this.gameParam.nightLength);
    }

    /** Function to add when a game is restored or start
     * Setup the game (probability, role, ...)
     * Add event call at each end of days (use interval or timeout), ...
     * @param {number} gameId id of the starting game
     * */
    public async initGame(): Promise<void> {
        LOGGER.log(`Initialisation de la partie : ${this.gameId}`);
        // if (this.getGameParam().nbPlayerMin > this.getNbOfPlayers()) {
        //     Game.removeGame(this.getGameId());
        //     await database.deleteFrom("games").where("games.id", "=", this.getGameId()).executeTakeFirst();
        //     this.getAllPlayers().forEach((player) => player.sendMessage("GAME_DELETED", { message: "game deleted" }));
        //     console.log("Suppresions de la partie");
        //     return;
        // }

        //Initialisation des roles et des pouvoirs
        LOGGER.log(`Initialisation des rôles : ${this.gameId}`);
        this.setupRoles();
        LOGGER.log(`Initialisation des pouvoirs : ${this.gameId}`);
        this.setupPower();

        // Initialisation des chats
        LOGGER.log(`Initialisation des chats : ${this.gameId}`);
        this.initChats();

        // Lancement du jeu avec la première nuit
        LOGGER.log(`game ${this.gameId} successfuly initialized`);
        this.startNight();
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
        return this.currentVote;
    }

    public setVote(vote: Vote): void {
        this.currentVote = vote;
    }

    public getChat(type: ChatType): Chat {
        if (this.chats.length !== 3) return null;
        return this.chats[type];
    }
    public getAllPlayers(): Array<Player> {
        return Array.from(this.players.values());
    }

    public getPlayer(username: string): Player {
        return this.players.get(username);
    }

    public getWerewolfs(): Array<Player> {
        return this.getAllPlayers().filter((player: Player) => player.isWerewolf());
    }

    public getGameRecap(): Record<string, any> {
        const usernameList: Array<string> = [];
        const usernameDeathList: Array<string> = [];
        const iterator = this.players.values();
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
    // public getStatus(): { status: number; timePassed: number } {
    //     const timeSinceGameStart: number = Date.now() - this.gameParam.startDate;
    //     if (timeSinceGameStart < 0) {
    //         return { status: -1, timePassed: 0 };
    //     } else {
    //         const timeOfOneCycle = this.gameParam.dayLength + this.gameParam.nightLength;
    //         const numberOfCycle = Math.floor(timeSinceGameStart / timeOfOneCycle);
    //         const timeSinceCycleStart = timeSinceGameStart % timeOfOneCycle;
    //         // If we are day.
    //         if (timeSinceCycleStart - this.gameParam.nightLength <= 0) return { status: 1 + 2 * numberOfCycle, timePassed: timeSinceCycleStart };
    //         else return { status: 2 * (numberOfCycle + 1), timePassed: timeSinceCycleStart - this.gameParam.nightLength };
    //     }
    // }

    public getStatus(): GameStatus {
        const timeSinceGameStart: number = Date.now() - this.gameParam.startDate;
        if (timeSinceGameStart < 0) return GameStatus.NOT_STARTED;
        const timeSinceCycleStart = timeSinceGameStart % (this.gameParam.dayLength + this.gameParam.nightLength);
        if (timeSinceCycleStart - this.gameParam.nightLength <= 0) return GameStatus.NIGHT;
        else return GameStatus.DAY;
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
            .addColumn("host", "text", (col) => col.notNull().references("users.username"))
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
            game.load();
        }

        // Initialisation des joueurs de chaque partie
        // const players: Array<{ name: string; role: number; power: number; game: number }> = await database.selectFrom("players").select(["name", "role", "power", "game"]).execute();
        // for (const elem of players) {
        //     const game: Game = Game.getGame(elem.game);
        //     const player: Player = new Player(User.getUser(elem.name), Villager.load(elem.role), elem.power, game);
        //     game.addPlayer(player);
        // }
        LOGGER.log("Chargement des parties déjà créées terminé");
    }

    public async load(): Promise<void> {
        const players = await database.selectFrom("players").select(["user", "alive", "werewolf", "power", "game"]).where("game", "=", this.getGameId()).execute();

        for (const dPlayer of players) {
            const player = await Player.load(this, { ...dPlayer, alive: toBoolean(dPlayer.alive), werewolf: toBoolean(dPlayer.werewolf) });
            this.addPlayer(player);
        }

        LOGGER.log(`Game ${this.gameId} successfully loaded`);
    }

}
