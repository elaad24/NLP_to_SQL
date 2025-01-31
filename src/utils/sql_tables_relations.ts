import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(__dirname, "../../db/database.sqlite"); // Adjust path to your SQLite file
const outputPath = path.resolve(__dirname, "../../db/table_relations.txt");

const fetchTableRelations = async () => {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error("Error connecting to SQLite:", err.message);
      return;
    }
    console.log("Connected to the SQLite database.");
  });

  const getTables = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';",
        (err, rows: any) => {
          if (err) reject(err);
          else resolve(rows.map((row: any) => row.name));
        }
      );
    });
  };

  const getTableColumns = (
    tableName: string
  ): Promise<{ name: string; type: string }[]> => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
        if (err) reject(err);
        else
          resolve(rows.map((row: any) => ({ name: row.name, type: row.type })));
      });
    });
  };

  const getForeignKeys = (
    tableName: string
  ): Promise<{ column: string; references: string }[]> => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA foreign_key_list(${tableName});`, (err, rows) => {
        if (err) reject(err);
        else
          resolve(
            rows.map((row: any) => ({
              column: row.from,
              references: `${row.table}(${row.to})`,
            }))
          );
      });
    });
  };

  try {
    const tables = await getTables();
    const results: any[] = [];

    for (const table of tables) {
      const columns = await getTableColumns(table);
      const foreignKeys = await getForeignKeys(table);

      results.push({
        tableName: table,
        columns,
        relationships: foreignKeys,
      });
    }

    const formattedOutput = JSON.stringify(results, null, 2);

    fs.writeFileSync(
      outputPath.replace(".txt", ".json"),
      formattedOutput,
      "utf-8"
    );
    console.log(
      `Table relations written to ${outputPath.replace(".txt", ".json")}`
    );

    console.log(`Table relations written to ${outputPath}`);
  } catch (error) {
    console.error("Error fetching table relations:", error);
  } finally {
    db.close((err) => {
      if (err) console.error("Error closing database connection:", err.message);
      else console.log("Database connection closed.");
    });
  }
};

fetchTableRelations();
