import { sql } from "kysely";
import database from "../util/database";
import { User } from "./userModel";
import { Player } from "./playerModel";

export enum Chat_type {
    CHAT_GLOBAL,
    CHAT_LOUP,
    CHAT_CHAMAN,
}

export type Message = { game: number; type: number; player: number; content: string; date: number };

export class Chat {

    private type: Chat_type;
    private messages: Array<Message>;
    private members: Array<Player>;

    constructor(type: Chat_type, members: Array<Player>) {
        this.type = type;
        this.members = members;
        this.messages = [];
    }

    public getType(): Chat_type {
        return this.type;
    }

    public addMessage(message: Message, author: User): void {
        this.messages.push(message);

        this.members.forEach((player) =>
            player
                .getUser()
                .getWebsocket()
                .send(
                    JSON.stringify({
                        event: "CHAT_RECEIVED",
                        data: {
                            author: author.getUsername(),
                            date: message.date,
                            chat_type: message.type,
                            content: message.content
                        }
                    })
                )
        );
    }

}

export const messageSchema = async (): Promise<void> => {
    await database.schema
        .createTable("messages")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("game", "integer", (col) => col.notNull())
        .addColumn("type", "integer", (col) => col.notNull())
        .addColumn("player", "integer", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("date", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();
};
