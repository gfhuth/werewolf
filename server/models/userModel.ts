import database from "../util/database";

class User {

    private userName: string;
    private isConnected = false;

    constructor(userName: string) {
        this.userName = userName;
    }

    public getStatus(): boolean {
        return this.isConnected;
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

export const reinitDatabase = async (): Promise<void> => {
    await database.insertInto("users").values({ username: "Damien", password: "TOTO" });
};
