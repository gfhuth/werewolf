import { Table } from "ts-sql-query/Table";
import { DBConnection } from "../database";

export const tableUsers = new (class TableUsers extends Table<DBConnection, "TableUsers"> {

    id = this.autogeneratedPrimaryKey("id", "int");
    username = this.column("username", "string");
    password = this.column("password", "string");

    constructor() {
        super("users");
    }

})();
