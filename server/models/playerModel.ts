import database from "../util/database";
import { Chat, Message } from "./chatModel";
import { Game } from "./gameModel";
import { User } from "./userModel";

export class Player {

    private user: User;
    private role: number;
    private power: number;
    private game: Game;

    constructor(user: User, role: number, power: number, game: Game) {
        this.user = user;
        this.role = role;
        this.power = power;
        this.game = game;
    }

    public getUser(): User {
        return this.user;
    }

    public getRole(): number {
        return this.role;
    }

    public addMessage(message: Message): void {
        // On récupère le chat concerné
        const chat: Chat = this.game
            .getChats()
            .reverse()
            .find((c) => c.getType() === message.type);
        // On envoie le message sur ce chat
        chat.addMessage(message, this.user);
    }

}

export const playerSchema = async (): Promise<void> => {
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
