"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Database connection
const dbPath = path_1.default.resolve(__dirname, "../../db/database.sqlite");
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to SQLite:", err.message);
    }
    else {
        console.log("Connected to SQLite database.");
    }
});
// SQL to create tables and insert data
const setupDatabase = () => {
    db.serialize(() => {
        console.log("Setting up database...");
        // 1. Create Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL
            );
        `);
        // 2. Create Products table
        db.run(`
            CREATE TABLE IF NOT EXISTS Products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL
            );
        `);
        // 3. Create Orders table with relationships
        db.run(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (product_id) REFERENCES Products(id)
            );
        `);
        // Insert mock data
        console.log("Inserting mock data...");
        // Insert Users
        db.run(`INSERT INTO Users (name, email) VALUES ('Alice', 'alice@example.com');`);
        db.run(`INSERT INTO Users (name, email) VALUES ('Bob', 'bob@example.com');`);
        // Insert Products
        db.run(`INSERT INTO Products (name, price) VALUES ('Laptop', 1200.99);`);
        db.run(`INSERT INTO Products (name, price) VALUES ('Phone', 699.49);`);
        // Insert Orders
        db.run(`INSERT INTO Orders (user_id, product_id, quantity) VALUES (1, 1, 1);`);
        db.run(`INSERT INTO Orders (user_id, product_id, quantity) VALUES (2, 2, 2);`);
        console.log("Database setup completed.");
    });
    db.close((err) => {
        if (err) {
            console.error("Error closing SQLite connection:", err.message);
        }
        else {
            console.log("SQLite connection closed.");
        }
    });
};
// Run setup
setupDatabase();
