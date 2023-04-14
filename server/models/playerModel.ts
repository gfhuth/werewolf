import database from "../util/database";
import { Game } from "./gameModel";

export class Player {

    public id: number;
    public name: number;
    public role: number;
    public power: number;
    public game: Game;
    constructor(id: number, name: number, role: number, power: number, game: Game) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.power = power;
        this.game = game;
    }

}

export const playerSchema = async (): Promise<void> => {
    await database.schema
        .createTable("players")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("role", "text")
        .addColumn("power", "text")
        .addColumn("user", "integer", (col) => col.references("users.id").onDelete("cascade"))
        .addColumn("game", "integer", (col) => col.references("games.id").onDelete("cascade"))
        .execute();
};
