import { Database } from "sqlite3";
import fs from "fs";

const db = new Database("db.sqlite");

function exec(query: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.exec(query, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export const createSchema = async (): Promise<void> => {
    await exec(fs.readFileSync(`${__dirname}/sql/schema.sql`).toString());
};
