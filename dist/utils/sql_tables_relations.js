"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, "../../db/database.sqlite"); // Adjust path to your SQLite file
const outputPath = path_1.default.resolve(__dirname, "../../db/table_relations.txt");
const fetchTableRelations = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = new sqlite3_1.default.Database(dbPath, sqlite3_1.default.OPEN_READONLY, (err) => {
        if (err) {
            console.error("Error connecting to SQLite:", err.message);
            return;
        }
        console.log("Connected to the SQLite database.");
    });
    const getTables = () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';", (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((row) => row.name));
            });
        });
    };
    const getTableColumns = (tableName) => {
        return new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((row) => ({ name: row.name, type: row.type })));
            });
        });
    };
    const getForeignKeys = (tableName) => {
        return new Promise((resolve, reject) => {
            db.all(`PRAGMA foreign_key_list(${tableName});`, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((row) => ({
                        column: row.from,
                        references: `${row.table}(${row.to})`,
                    })));
            });
        });
    };
    try {
        const tables = yield getTables();
        const results = [];
        for (const table of tables) {
            const columns = yield getTableColumns(table);
            const foreignKeys = yield getForeignKeys(table);
            results.push({
                tableName: table,
                columns,
                relationships: foreignKeys,
            });
        }
        const formattedOutput = JSON.stringify(results, null, 2);
        fs_1.default.writeFileSync(outputPath.replace(".txt", ".json"), formattedOutput, "utf-8");
        console.log(`Table relations written to ${outputPath.replace(".txt", ".json")}`);
        console.log(`Table relations written to ${outputPath}`);
    }
    catch (error) {
        console.error("Error fetching table relations:", error);
    }
    finally {
        db.close((err) => {
            if (err)
                console.error("Error closing database connection:", err.message);
            else
                console.log("Database connection closed.");
        });
    }
});
fetchTableRelations();
