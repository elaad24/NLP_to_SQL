import sqlite3 from "sqlite3";

// Connect to SQLite
const db = new sqlite3.Database("database.sqlite");

/**
 * this function take the json formatted answer and iterate it and execute it step by step and return the output answer
 *@returns {answer: results,lastSqlQuery: lastSqlQuery};
 */
export const executeSQLQueries = async (steps: any[]) => {
  const results: Record<number, any> = {}; // Store results per step
  let lastSqlQuery = "";
  for (const step of steps) {
    let query = step.sql_query;

    // Handle dependent queries
    if (step.depends_on_previous) {
      const prevStepIndex = step.step - 1; // Get previous step index
      const previousResult = results[prevStepIndex];

      if (!previousResult) {
        console.error(`Missing result for step ${prevStepIndex}`);
        return;
      }

      // Replace {previous_result} placeholder with the actual value
      const resultValue = Object.values(previousResult)[0]; // Assume single value
      query = query.replace("{previous_result}", resultValue);
      lastSqlQuery = query;
    }

    // Execute SQL Query
    const result = await runSQLQuery(query);
    results[step.step] = result;
  }
  return {
    answer: results,
    lastSqlQuery: lastSqlQuery,
  };
};

// Helper function to execute SQL queries
const runSQLQuery = (query: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
