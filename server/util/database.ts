import betterSqlite3 from "better-sqlite3";
import fs from "fs";

const connection = betterSqlite3("db.sqlite");

export const createSchema = async (): Promise<void> => {
    connection.exec(fs.readFileSync(`${__dirname}/sql/schema.sql`).toString());
};

export default connection;
