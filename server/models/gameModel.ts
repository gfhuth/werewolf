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
import { User } from "./userModel";

const LOGGER = new Logger("GAME");

export enum GameStatus {
    NOT_STARTED = -1,
    NIGHT = 0,
    DAY = 1,
}

export enum Role {
    HUMAN,
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
    private host: User;
    private gameParam: GameParam;
    private players: Map<string, Player> = new Map();
    private chats: Array<Chat>;
    private currentVote: Vote;

    constructor(gameId: number, host: User, gameParam: GameParam) {
        this.gameId = gameId;
        this.host = host;
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
        // Ajout de l'insomnie dans le chat des loup-garous
        this.chats.push(
            new Chat(
                ChatType.CHAT_WEREWOLF,
                this.getWerewolfs().concat(
                    this.getAllPlayers().filter((player) => {
                        if (!player.getPower()) return false;
                        else return player.getPower().getName() === ClairvoyancePower.POWERNAME;
                    })
                )
            )
        );
        this.chats.push(new Chat(ChatType.CHAT_SPIRITISM, []));
    }
    /**
     * Mise à jour du chat du chaman
     * @param {Player} chaman Joueur ayant le pouvoir de spiritisme
     * @param {Player} deadPlayer Joueur mort qui échange avec lui la nuit
     * @returns {void}
     */
    public setChatSpiritism(chaman: Player, deadPlayer: Player): void {
        this.chats[ChatType.CHAT_SPIRITISM].resetChatMembers([chaman, deadPlayer]);
    }

    public addPlayer(player: Player): void {
        this.players.set(player.getUser().getUsername(), player);
    }
    public removePlayer(username: string): void {
        this.players.delete(username);
    }
    public isUserPlaying(user: User): boolean {
        return this.players.has(user.getUsername());
    }
    public getHost(): User {
        return this.host;
    }

    private setupRoles(): void {
        const nbWerewolfs: number = Math.max(1, Math.ceil(this.gameParam.percentageWerewolf * this.getAllPlayers().length));
        const players: Array<Player> = this.getAllPlayers();
        const werewolfs: Array<Player> = [];
        while (players.length > 0 && werewolfs.length < nbWerewolfs) {
            const werewolf: Player = players[Math.floor(Math.random() * players.length)];
            werewolf.setWerewolf(true);
            werewolf.sendMessage("SET_ROLE", { role: Role.WEREWOLF, nbWerewolfs: nbWerewolfs });
            werewolfs.push(werewolf);
            players.splice(players.indexOf(werewolf), 1);
        }
        players.forEach((player) => {
            player.setWerewolf(false);
            player.sendMessage("SET_ROLE", { role: Role.HUMAN, nbWerewolfs: nbWerewolfs });
        });
        LOGGER.log(`${nbWerewolfs} werewolf(s) in this game`);
        werewolfs.forEach((player) => LOGGER.log(`${player.getUser().getUsername()} is a werewolf in this game`));
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
        if (playersWithoutPower.length > 0 && Math.random() <= this.gameParam.probaSpiritisme) {
            const spiritisme: Player = playersWithoutPower[Math.floor(Math.random() * playersWithoutPower.length)];
            spiritisme.setPower(new SpiritismPower());
            spiritisme.sendMessage("SET_POWER", { power: spiritisme.getPower().getName() });
        }

        playersWithoutPower = playersWithoutPower.filter((player) => !player.getPower());
        if (playersWithoutPower.length > 0 && Math.random() <= this.gameParam.probaVoyance) {
            const voyance: Player = playersWithoutPower[Math.floor(Math.random() * playersWithoutPower.length)];
            voyance.setPower(new ClairvoyancePower());
            voyance.sendMessage("SET_POWER", { power: voyance.getPower().getName() });
        }
    }

    public verifyEndGame(): boolean {
        let winningRole: Role;
        if (this.getWerewolfs().filter((player) => !player.isDead()).length === 0) winningRole = Role.HUMAN;
        else if (this.getAllPlayers().filter((player) => !player.isWerewolf() && !player.isDead()).length === 0) winningRole = Role.WEREWOLF;

        if (winningRole === Role.HUMAN || winningRole === Role.WEREWOLF) {
            this.getAllPlayers().forEach((player) => player.sendMessage("END_GAME", { winningRole: winningRole }));
            return true;
        }

        return false;
    }

    applyPower(): void {
        throw new Error("Not Implemented yet");
    }

    startDay(): void {
        LOGGER.log(`game ${this.getGameId()} changed to day`);

        // Mort du résultat des votes
        const resultWerewolfVote: Player = this.currentVote.getResult();
        if (resultWerewolfVote) {
            resultWerewolfVote.kill();
            LOGGER.log(`player ${resultWerewolfVote.getUser().getUsername()} is dead`);
        }

        // Vérification si fin de partie
        const isEndGame: boolean = this.verifyEndGame();

        if (!isEndGame) {
            // Réinitialisation du chat
            this.getChat(ChatType.CHAT_VILLAGE).resetMessages();

            // Initialisation du vote
            this.setVote(new Vote(VoteType.VOTE_VILLAGE, Player.alivePlayers(this.getAllPlayers())));

            const infoPlayers = this.getAllPlayers().map((player) => ({
                user: player.getUser().getUsername(),
                alive: !player.isDead()
            }));

            // Envoie à chaque joueur un recap de la nuit
            this.getAllPlayers().forEach((player) => {
                player.sendMessage("DAY_STARTS", {});
                player.sendMessage("LIST_PLAYERS", { players: infoPlayers });
            });

            setTimeout(this.startNight.bind(this), this.gameParam.dayLength);
        }
    }

    startNight(): void {
        LOGGER.log(`game ${this.getGameId()} changed to night`);

        // Mort du résultat des votes
        if (this.currentVote) {
            const resultVillageVote: Player = this.currentVote.getResult();
            if (resultVillageVote) {
                resultVillageVote.kill();
                LOGGER.log(`player ${resultVillageVote.getUser().getUsername()} is dead`);
            }
        }

        // Vérification si fin de partie
        const isEndGame: boolean = this.verifyEndGame();

        if (!isEndGame) {
            // Réinitialisation des chats
            this.getChat(ChatType.CHAT_WEREWOLF).resetMessages();
            this.getChat(ChatType.CHAT_WEREWOLF).resetChatMembers(this.getWerewolfs().concat(this.getAllPlayers().filter((player) => !player.isWerewolf() && player.isDead())));

            this.getChat(ChatType.CHAT_SPIRITISM).resetMessages();
            this.getChat(ChatType.CHAT_SPIRITISM).resetChatMembers([]);

            // Initialisation du vote
            this.setVote(new Vote(VoteType.VOTE_WEREWOLF, Player.alivePlayers(this.getWerewolfs())));

            const infoPlayers = this.getAllPlayers().map((player) => ({
                user: player.getUser().getUsername(),
                alive: !player.isDead()
            }));

            // Envoie à chaque joueur un recap du jour
            this.getAllPlayers().forEach((player) => {
                player.sendMessage("NIGHT_STARTS", {});
                player.sendMessage("LIST_PLAYERS", { players: infoPlayers });
            });

            setTimeout(this.startDay.bind(this), this.gameParam.nightLength);
        }
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
        const game: { id: number; host: string } & GameParam = await database
            .selectFrom("games")
            .select([
                "id",
                "nbPlayerMin",
                "nbPlayerMax",
                "dayLength",
                "nightLength",
                "startDate",
                "percentageWerewolf",
                "probaContamination",
                "probaInsomnie",
                "probaVoyance",
                "probaSpiritisme",
                "host"
            ])
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

        return new Game(gameId, await User.load(game.host), gameParams);
    }

    public static getAllGames(): Array<Game> {
        return Array.from(Game.games.values());
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
        const gamelist: Array<{ id: number; host: string } & GameParam> = await database
            .selectFrom("games")
            .select([
                "id",
                "host",
                "nbPlayerMin",
                "nbPlayerMax",
                "dayLength",
                "nightLength",
                "startDate",
                "percentageWerewolf",
                "probaContamination",
                "probaInsomnie",
                "probaVoyance",
                "probaSpiritisme"
            ])
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
            const game: Game = new Game(elem.id, await User.load(elem.host), gameParams);
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
