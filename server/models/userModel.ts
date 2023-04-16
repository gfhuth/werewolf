import database from "../util/database";

export const usersHandler: {
    [key: string]: User;
} = {};

export class User {

    private userId: number;
    private username: string;

    constructor(userId: number, username: string) {
        this.username = username;
        this.userId = userId;
    }

    static async load(username: string): Promise<User> {
        const userId: { id: number } = await database.selectFrom("users").select(["id"]).where("username", "=", username).executeTakeFirstOrThrow();
        return new User(userId.id, username);
    }

    public getUsername(): string {
        return this.username;
    }

    public getUserId(): number {
        return this.userId;
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
        usersHandler[elem.username] = user;
    }
};

export const insertUser = async (user: { username: string; password: string }): Promise<void> => {
    await database.insertInto("users").values(user).execute();
};

export const listUsers = async (): Promise<Array<{ username: string; password: string }>> => await database.selectFrom("users").select(["username", "password"]).execute();
