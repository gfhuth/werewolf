import betterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

import { Database } from "./sql/schema";
import { gameSchema } from "../models/gameModel";
import { playerSchema } from "../models/playerModel";
import { userSchema } from "../models/userModel";
import { messageSchema } from "../models/chatModel";

const database = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: betterSqlite3("db.sqlite")
    })
});

export const createSchema = async (): Promise<void> => {
    userSchema();
    playerSchema();
    gameSchema();
    messageSchema();
};

export default database;
