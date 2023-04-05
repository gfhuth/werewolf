import { sql } from "kysely";
import database from "../util/database";

export const messageSchema = async (): Promise<void> => {
    await database.schema
        .createTable("messages")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("game", "integer", (col) => col.notNull())
        .addColumn("chat", "integer", (col) => col.notNull())
        .addColumn("player", "integer", (col) => col.notNull())
        .addColumn("text", "text", (col) => col.notNull())
        .addColumn("time", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();
};

export type MessageObject = {
    id: number;
    game: number;
    chat: number;
    player: number;
    text: string;
    time: number;
};

export const createMessage = async (message: { game: number, chat: number; player: number; text: string }): Promise<void> => {
    await database.insertInto("messages").values(message).execute();
};

export const getMessagesFromChat = async (game: number, chat: number): Promise<Array<MessageObject>> =>
    await database.selectFrom("messages").select(["id", "game", "chat", "player", "text", "time"]).where("game", "=", game).where("chat", "=", chat).execute();
