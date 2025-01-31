import sqlite3 from "sqlite3";
import path from "path";

// Database connection
const dbPath = path.resolve(__dirname, "../../db/database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err.message);
  } else {
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

    // 2. Create Customers table
    db.run(`
      CREATE TABLE IF NOT EXISTS Customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          age INTEGER,
          location TEXT,
          signup_date DATE
      );
    `);

    // 3. Create Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS Products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          category_id INTEGER,
          FOREIGN KEY (category_id) REFERENCES Categories(id)
      );
    `);

    // 4. Create Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS Categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
      );
    `);

    // 5. Create Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS Orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          order_date DATE NOT NULL DEFAULT CURRENT_DATE,
          FOREIGN KEY (user_id) REFERENCES Users(id),
          FOREIGN KEY (product_id) REFERENCES Products(id)
      );
    `);

    // 6. Create Sales_Trends table
    db.run(`
      CREATE TABLE IF NOT EXISTS Sales_Trends (
          product_id INTEGER NOT NULL,
          date DATE NOT NULL,
          units_sold INTEGER NOT NULL,
          FOREIGN KEY (product_id) REFERENCES Products(id)
      );
    `);

    // 7. Create Marketing_Campaigns table
    db.run(`
      CREATE TABLE IF NOT EXISTS Marketing_Campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          budget REAL NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          success_metric TEXT NOT NULL,
          FOREIGN KEY (product_id) REFERENCES Products(id)
      );
    `);

    // Insert mock data
    console.log("Inserting mock data...");

    // Insert Users
    db.run(
      `INSERT INTO Users (name, email) VALUES ('Alice', 'alice@example.com');`
    );
    db.run(
      `INSERT INTO Users (name, email) VALUES ('Bob', 'bob@example.com');`
    );

    // Insert Customers
    db.run(
      `INSERT INTO Customers (name, age, location, signup_date) VALUES ('Alice', 28, 'New York', '2022-05-10');`
    );
    db.run(
      `INSERT INTO Customers (name, age, location, signup_date) VALUES ('Bob', 32, 'Los Angeles', '2023-02-15');`
    );

    // Insert Categories
    db.run(`INSERT INTO Categories (name) VALUES ('Electronics');`);
    db.run(`INSERT INTO Categories (name) VALUES ('Home Appliances');`);

    // Insert Products
    db.run(
      `INSERT INTO Products (name, price, category_id) VALUES ('Laptop', 1200.99, 1);`
    );
    db.run(
      `INSERT INTO Products (name, price, category_id) VALUES ('Phone', 699.49, 1);`
    );
    db.run(
      `INSERT INTO Products (name, price, category_id) VALUES ('Vacuum Cleaner', 199.99, 2);`
    );

    // Insert Orders
    db.run(
      `INSERT INTO Orders (user_id, product_id, quantity, order_date) VALUES (1, 1, 1, '2024-01-10');`
    );
    db.run(
      `INSERT INTO Orders (user_id, product_id, quantity, order_date) VALUES (2, 2, 2, '2024-02-05');`
    );
    db.run(
      `INSERT INTO Orders (user_id, product_id, quantity, order_date) VALUES (1, 3, 1, '2024-02-20');`
    );

    // Insert Sales Trends
    db.run(
      `INSERT INTO Sales_Trends (product_id, date, units_sold) VALUES (1, '2024-01-01', 50);`
    );
    db.run(
      `INSERT INTO Sales_Trends (product_id, date, units_sold) VALUES (2, '2024-01-01', 30);`
    );
    db.run(
      `INSERT INTO Sales_Trends (product_id, date, units_sold) VALUES (3, '2024-01-01', 10);`
    );
    db.run(
      `INSERT INTO Sales_Trends (product_id, date, units_sold) VALUES (1, '2024-02-01', 70);`
    );
    db.run(
      `INSERT INTO Sales_Trends (product_id, date, units_sold) VALUES (2, '2024-02-01', 40);`
    );

    // Insert Marketing Campaigns
    db.run(`INSERT INTO Marketing_Campaigns (product_id, budget, start_date, end_date, success_metric) 
            VALUES (1, 5000, '2024-01-01', '2024-01-31', 'Increased sales by 20%');`);
    db.run(`INSERT INTO Marketing_Campaigns (product_id, budget, start_date, end_date, success_metric) 
            VALUES (2, 3000, '2024-02-01', '2024-02-28', 'Increased sales by 15%');`);

    console.log("Database setup completed.");
  });

  db.close((err) => {
    if (err) {
      console.error("Error closing SQLite connection:", err.message);
    } else {
      console.log("SQLite connection closed.");
    }
  });
};

// Run setup
setupDatabase();
