import database from "../util/database";

export const chatSchema = async (): Promise<void> => {
    await database.schema
        .createTable("chats")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("game", "integer", (col) => col.defaultTo(5).notNull())
        .execute();
};

export const createChat = async (game: number): Promise<void> => {
    await database.insertInto("chats").values(game).execute();
};
