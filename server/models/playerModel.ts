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
        if (this.role == null) this.role = role;
    }

    public contaminated(): void {
        if (this.role instanceof Human)
            this.role = new Werewolf;
    }

    /** Send at the client a recap of the game
     */
    public sendNewGameRecap(): void {
        let powerNumber: number;
        // because power can be null
        if (this.getRole().getPower()) 
            powerNumber = this.getRole().getPower().getPowerValue();
        else 
            powerNumber = -1;
        
        this.user.sendMessage({
            game_id: this.game.getGameId(),
            event: "GAME_RECAP",
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
