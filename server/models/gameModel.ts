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
        .addColumn("nbPlayerMin", "integer")
        .addColumn("nbPlayerMax", "integer")
        .addColumn("dayLength", "integer")
        .addColumn("nightLength", "integer")
        .addColumn("startDate", "integer")
        .addColumn("percentageWerewolf", "integer")
        .addColumn("probaContamination", "integer")
        .addColumn("probaInsomnie", "integer")
        .addColumn("probaVoyance", "integer")
        .addColumn("probaSpiritisme", "integer")
        .execute();
};
