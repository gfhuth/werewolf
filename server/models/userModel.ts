import database from "../util/database";
import { Game } from "./gameModel";

export const usersHandler: {
    [key: string]: User;
} = {};

export class User {

    private userId: number;
    private username: string;
    private gamesList: Array<Game>;

    constructor(userId: number, username: string) {
        this.username = username;
        this.userId = userId;
        this.gamesList = [];
    }

    static async load(username: string): Promise<User> {
        const userId: { id: number } = await database.selectFrom("users").select(["id"]).where("username", "=", username).executeTakeFirstOrThrow();
        return new User(userId.id, username);
    }

    private loadAsync = async (username: string): Promise<void> => {
        this.username = username;
        const userIdentifier: { id: number } = await database.selectFrom("users").select(["id"]).where("username", "=", username).executeTakeFirstOrThrow();
        this.userId = userIdentifier.id;
        this.gamesList = [];
    };

    public getUsername(): string {
        return this.username;
    }

    public getUserId(): number {
        return this.userId;
    }

    public playInGame(gameId: number): boolean {
        for (const game of this.gamesList) if (gameId === game.getGameId()) return true;
        return false;
    }

    public addGame(game: Game): void {
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

    const users: Array<{ username: string }> = await database.selectFrom("users").select("username").execute();
    for (const elem of users) {
        const user: User = await User.load(elem.username);
        // On récupère les parties d'un utilisateur
        const gamesDBList: Array<{ id: number }> = await database
            .selectFrom("games")
            .innerJoin("players", "games.id", "players.game")
            .select(["games.id"])
            .where("players.user", "=", user.getUserId())
            .execute();
        for (const game of gamesDBList) user.addGame(await Game.load(game.id));
        usersHandler[elem.username] = user;
    }
};

export const insertUser = async (user: { username: string; password: string }): Promise<void> => {
    await database.insertInto("users").values(user).execute();
};

export const listUsers = async (): Promise<Array<{ username: string; password: string }>> => await database.selectFrom("users").select(["username", "password"]).execute();
