import database from "../util/database";
import { Game } from "./gameModel";
import { Contamination } from "./powersModel";
import { User } from "./userModel";
import { Human, Villager, Werewolf } from "./villagerModel";

export class Player {

    private user: User;
    private role: Villager;
    private power: number;
    private game: Game;
    private isAlive: Boolean;

    constructor(user: User, role: Villager, power: number, game: Game) {
        this.user = user;
        this.role = role;
        this.power = power;
        this.game = game;
        this.isAlive = true;
    }

    public isDeath(): Boolean {
        return !this.isAlive;
    }
    public kill(): void {
        this.isAlive = false;
    }

    public getUser(): User {
        return this.user;
    }

    public getRole(): Villager {
        return this.role;
    }

    public getPower(): number {
        return this.power;
    }

    public setRole(role: Villager): void {
        if (this.role === null) this.role = role;
    }

    // Maybe we need to wait to contamine, and notify game.
    public contaminated(): boolean {
        if (this.role instanceof Human) {
            this.role = new Werewolf();
            return true;
        }
        return false;
    }

    public usePower(): void {
        if (this.role.getPower() != null) {
            if (!this.role.getPower().getPowerAlreadyUsed()) {
                const data: Record<string, any> = this.role.getPower().usePower();
                this.sendMessage("USE_POWER_VALID", data);
                return;
            } else {
                this.sendError("USE_POWER", 403, "Problem was already used");
            }
        }
        this.sendError("USE_POWER", 403, "You don't have");
    }

    public sendMessage(event: string, data: Record<string, any>): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), data: data });
    }

    public sendError(event: string, status: number, errorMessage: string): void {
        this.user.sendMessage({ event: event, game_id: this.game.getGameId(), status: status, message: errorMessage });
    }

    /** Send at the client a recap of the game
     */
    public sendNewGameRecap(): void {
        let powerNumber: number;
        // because power can be null
        if (!this.getRole()) throw new Error(`player ${this.getUser().getUsername()} don't have role set on game ${this.game.getGameId()}.`);
        if (this.getRole().getPower()) powerNumber = this.getRole().getPower().getPowerValue();
        else powerNumber = -1;

        this.user.sendMessage({
            game_id: this.game.getGameId(),
            event: "GET_ALL_INFO_GAME",
            data: {
                game: this.game.getGameRecap(),
                player: {
                    role: this.getRole().getRoleValue(),
                    power: powerNumber
                }
            }
        });
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("players")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("name", "text", (col) => col.notNull())
            .addColumn("role", "integer")
            .addColumn("power", "integer")
            .addColumn("user", "integer", (col) => col.references("users.id").onDelete("cascade"))
            .addColumn("game", "integer", (col) => col.references("games.id").onDelete("cascade"))
            .execute();
    };

}
