import { ServerToClientEvents } from "../controllers/event/eventTypes";
import database from "../util/database";
import { Game, GameStatus, Role } from "./gameModel";
import Power from "./powerModelBetter";
import { User } from "./userModel";

export class Player {

    private user: User;
    private werewolf: boolean;
    private power: Power;
    private game: Game;
    private isAlive: boolean;

    constructor(user: User, game: Game) {
        this.user = user;
        this.game = game;
        this.isAlive = true;
    }

    public static alivePlayers(players: Array<Player>): Array<Player> {
        return players.filter((player) => !player.isDead());
    }

    public isDead(): boolean {
        return !this.isAlive;
    }
    public setAlive(alive: boolean): void {
        this.isAlive = alive;
    }

    public kill(): void {
        this.isAlive = false;
    }

    public getUser(): User {
        return this.user;
    }

    public getName(): string {
        return this.getUser().getUsername();
    }

    public getRole(): Role {
        return this.isWerewolf() ? Role.WEREWOLF : Role.HUMAN;
    }

    public getPowerName(): string {
        return this.getPower() ? this.getPower().getName() : "NO_POWER";
    }

    public getPower(): Power {
        return this.power;
    }

    public setPower(power: Power): void {
        this.power = power;
    }

    public isWerewolf(): boolean {
        return this.werewolf;
    }

    public setWerewolf(value: boolean): void {
        this.werewolf = value;
    }

    public contaminated(): boolean {
        if (this.werewolf === false) {
            this.werewolf = true;
            return true;
        }
        return false;
    }

    public sendMessage<T extends keyof ServerToClientEvents>(event: T, data: ServerToClientEvents[T]): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), data: data });
    }

    public sendError(event: string, status: number, errorMessage: string): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), data: { status: status, message: errorMessage } });
    }

    public sendInfoAllPlayers(): void {
        const infoPlayers = this.game.getAllPlayers().map((player) => {
            const role: Role = (this.isWerewolf() && player.isWerewolf()) || player === this || player.isDead() ? player.getRole() : null;
            const power: string = player === this || player.isDead() ? this.getPowerName() : null;
            return {
                user: player.getName(),
                alive: !player.isDead(),
                role: role,
                power: power
            };
        });
        this.sendMessage("LIST_PLAYERS", { players: infoPlayers });
    }

    public sendPowerState(): void {
        if (!this.power) return;
        if (this.game.getStatus() === GameStatus.DAY || this.getPower().getAlreadyUsed()) this.sendMessage("POWER_END", {});
        if (this.game.getStatus() === GameStatus.NIGHT) this.sendMessage("POWER_START", {});
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("players")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("power", "text")
            .addColumn("alive", "boolean")
            .addColumn("werewolf", "boolean")
            .addColumn("user", "text", (col) => col.references("users.username").onDelete("cascade"))
            .addColumn("game", "integer", (col) => col.references("games.id").onDelete("cascade"))
            .execute();
    };

    /**
     * Sett player data
     * @param {Game} game player's game
     * @param {Record<string, any>} data player data
     * @returns {Player}
     */
    public static async load(game: Game, data: { user: string; power: string; werewolf: boolean; alive: boolean }): Promise<Player> {
        const user = await User.load(data.user);
        const player = new Player(user, game);
        player.setWerewolf(data.werewolf);
        player.setAlive(data.alive);

        // TODO load power

        return player;
    }

}
