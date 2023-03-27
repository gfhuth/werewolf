import betterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Database } from "./sql/schema";

const database = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: betterSqlite3("db.sqlite")
    })
});

export const createSchema = async (): Promise<void> => {
    await database.schema
        .createTable("users")
        .ifNotExists()
        .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
        .addColumn("username", "text", (col) => col.unique())
        .addColumn("password", "text")
        .execute();
};

export default database;
