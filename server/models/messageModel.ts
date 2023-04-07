import { sql } from "kysely";
import database from "../util/database";

export enum Chat {
    CHAT_GLOBAL,
    CHAT_LOUP,
    CHAT_CHAMAN,
}

export class Message {

    type: Chat;

}

export const messageSchema = async (): Promise<void> => {
    await database.schema
        .createTable("messages")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("game", "integer", (col) => col.notNull())
        .addColumn("chat", "integer", (col) => col.notNull())
        .addColumn("user", "integer", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("date", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();
};

export type MessageObject = {
    id: number;
    game: number;
    chat: number;
    user: number;
    content: string;
    date: number;
};

export const createMessage = (message: { game: number; chat: number; user: number; content: string; date: number }): void => {
    database.insertInto("messages").values(message).execute();
};
