import { sql } from "kysely";
import database from "../util/database";

export type GameParam = {
    id: number;
    nbPlayer: number;
    dayLenght: number;
    nightLenght: number;
    startDate: number;
    percentWereWolf: number;
    proba: { contamination: number; insomnie: number; voyance: number; spiritisme: number };
};

export class Game {

    private gameParam: GameParam;
    constructor(gameParam: GameParam) {
        this.gameParam = gameParam;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }

}

export const gameSchema = async (): Promise<void> => {
    await database.schema
        .createTable("games")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("nbPlayerMin", "integer", (col) => col.defaultTo(5).notNull())
        .addColumn("nbPlayerMax", "integer", (col) => col.defaultTo(20).notNull())
        .addColumn("dayLength", "integer", (col) => col.defaultTo(10).notNull())
        .addColumn("nightLength", "integer", (col) => col.defaultTo(12).notNull())
        .addColumn("startDate", "integer", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn("percentageWerewolf", "integer", (col) => col.defaultTo(0.33).notNull())
        .addColumn("probaContamination", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaInsomnie", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaVoyance", "integer", (col) => col.defaultTo(0).notNull())
        .addColumn("probaSpiritisme", "integer", (col) => col.defaultTo(0).notNull())
        .execute();
};

export type GameObject = {
    nbPlayerMin: number;
    nbPlayerMax: number;
    dayLength: number;
    nightLength: number;
    startDate: number;
    percentageWerewolf: number;
    probaContamination: number;
    probaInsomnie: number;
    probaVoyance: number;
    probaSpiritisme: number;
}

export const createGame = async (game: GameObject): Promise<void> => {
    await database.insertInto("games").values(game).execute();
};
