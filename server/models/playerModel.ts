import { ServerToClientEvents } from "../controllers/event/eventTypes";
import database from "../util/database";
import { Game } from "./gameModel";
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

    public getPower(): Power {
        return this.power;
    }

    public setPower(power: Power): void {
        this.power = power;
    }

    public hasPower(name: string): boolean {
        return this.getPower() && this.getPower().getName() === name;
    }

    public isWerewolf(): boolean {
        return this.werewolf;
    }

    public setWerewolf(value: boolean): void {
        this.werewolf = value;
    }

    public sendMessage<T extends keyof ServerToClientEvents>(event: T, data: ServerToClientEvents[T]): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), data: data });
    }

    public sendError(event: string, status: number, errorMessage: string): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), data: { status: status, message: errorMessage } });
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

    public static async load(game: Game, data: { user: string; power: string; werewolf: boolean; alive: boolean }): Promise<Player> {
        const user = await User.load(data.user);
        const player = new Player(user, game);
        player.setWerewolf(data.werewolf);
        player.setAlive(data.alive);

        // TODO load power

        return player;
    }

}
