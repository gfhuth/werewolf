import * as WebSocket from "ws";
import database from "../util/database";

export class User {

    private static usersSet: { [key: string]: User } = {};

    private userId: number;
    private username: string;
    private ws: WebSocket;

    constructor(userId: number, username: string) {
        this.username = username;
        this.userId = userId;
        this.ws = null;
    }

    static async load(username: string): Promise<User> {
        const userId: { id: number } = await database.selectFrom("users").select(["id"]).where("username", "=", username).executeTakeFirstOrThrow();
        const user: User = new User(userId.id, username);
        User.usersSet[user.getUsername()] = user;
        return user;
    }

    public getUsername(): string {
        return this.username;
    }

    public getUserId(): number {
        return this.userId;
    }

    public static getUser(username: string): User {
        return User.usersSet[username];
    }

    public getWebsocket(): WebSocket {
        return this.ws;
    }

    public setWebsocket(ws: WebSocket): void {
        this.ws = ws;
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("users")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("username", "text", (col) => col.unique().notNull())
            .addColumn("password", "text", (col) => col.notNull())
            .execute();
    
        const users: Array<{ username: string }> = await database.selectFrom("users").select("username").execute();
        for (const elem of users) 
            await User.load(elem.username);
    };

}
