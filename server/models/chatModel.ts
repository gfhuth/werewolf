import { sql } from "kysely";
import database from "../util/database";
import { Player } from "./playerModel";

export enum ChatType {
    CHAT_VILLAGE,
    CHAT_WEREWOLF,
    CHAT_SPIRITISM,
}

export type Message = { game: number; type: number; user: number; content: string; date: number };

export class Chat {

    private type: ChatType;
    private messages: Array<Message>;
    private members: Array<Player>;

    constructor(type: ChatType, members: Array<Player>) {
        this.type = type;
        this.members = members;
        this.messages = [];
    }

    public getType(): ChatType {
        return this.type;
    }

    public getMembers(): Array<Player> {
        return this.members;
    }

    public getMessages(): Array<Message> {
        return this.messages;
    }

    public resetMessages(): void {
        this.messages.length = 0;
    }

    public resetChatMembers(newMembers: Array<Player>): void {
        this.members = newMembers;
    }

    /**
     * Ajoute un message dans le chat et l'envoie à tous les membres du chat
     * @param {string} message Message envoyé
     */
    public addMessage(message: Message): void {
        this.messages.push(message);

        this.members.forEach((player) =>
            player.sendMessage("CHAT_RECEIVED", {
                author: message.user,
                date: message.date,
                chat_type: message.type,
                content: message.content
            })
        );
    }

    public static schema = async (): Promise<void> => {
        await database.schema
            .createTable("messages")
            .ifNotExists()
            .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
            .addColumn("game", "integer", (col) => col.notNull())
            .addColumn("type", "integer", (col) => col.notNull())
            .addColumn("user", "integer", (col) => col.notNull())
            .addColumn("content", "text", (col) => col.notNull())
            .addColumn("date", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .execute();
    };

}
