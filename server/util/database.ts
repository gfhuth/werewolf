import betterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Database } from "./sql/schema";

import fs from "fs";
const db = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: betterSqlite3("db.sqlite")
    })
});

export const createSchema = async (): Promise<void> => {
    // connection.exec(fs.readFileSync(`${__dirname}/sql/schema.sql`).toString());
    await db.schema.createTable("users").addColumn("id", "integer").addColumn("username", "text").addColumn("password", "text").execute();
    console.log(await db.insertInto("users").values({ username: "Bruno", password: "1234" }).returning("id").executeTakeFirstOrThrow());
};

export default db;
