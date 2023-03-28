import database from "../util/database";

export const playerSchema = async (): Promise<void> => {
    await database.schema
        .createTable("players")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("role", "text", (col) => col.notNull())
        .addColumn("power", "text")
        .addColumn("user", "integer", (col) => col.references("users.id").onDelete("cascade"))
        .addColumn("game", "integer", (col) => col.references("games.id").onDelete("cascade"))
        .execute();
};
