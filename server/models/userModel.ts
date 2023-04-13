import database from "../util/database";
import { Game } from "./gameModel";

export const usersHandler: {
    [key: string]: User;
} = {};

export class User {

    private userId: number;
    private username: string;
    private gamesList: Array<Game>;

    constructor(username: string) {
        this.loadAsync(username);
    }

    private loadAsync = async (username: string): Promise<void> => {
        this.username = username;
        const userIdentifier: { id: number } = await database.selectFrom("users").select(["id"]).where("username", "=", username).executeTakeFirstOrThrow();
        this.userId = userIdentifier.id;
        this.gamesList = [];
    };

    getUsername(): string {
        return this.username;
    }

    getUserId(): number {
        return this.userId;
    }

    playInGame(gameId: number): boolean {
        for (const game of this.gamesList) if (gameId === game.getGameId()) return true;

        return false;
    }

    addGame(game: Game): void {
        this.gamesList.push(game);
    }

}

export const userSchema = async (): Promise<void> => {
    await database.schema
        .createTable("users")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("username", "text", (col) => col.unique().notNull())
        .addColumn("password", "text", (col) => col.notNull())
        .execute();
};

export const insertUser = async (user: { username: string; password: string }): Promise<void> => {
    await database.insertInto("users").values(user).execute();
};

export const listUsers = async (): Promise<Array<{ username: string; password: string }>> => await database.selectFrom("users").select(["username", "password"]).execute();
