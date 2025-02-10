Here’s a **detailed `README.md`** for your project, written for **developers and programmers**. It explains the **architecture, workflow, and implementation** in depth.

---

# **AI-Driven SQL Query Generator & Execution System**

This project implements an **AI-driven reasoning system** that:

- Breaks down **complex business questions** into structured **reasoning steps**.
- Generates **optimized SQL queries** for each reasoning step.
- Executes queries **sequentially or in parallel** based on dependencies.
- Uses **CTEs (Common Table Expressions)** to **combine multiple queries** into a **single efficient SQL query**.
- Implements **caching and optimization techniques** to improve performance.

## **🚀 Features**

✔ **AI-Powered SQL Generation** – Uses LLM (Large Language Model) to convert human queries into optimized SQL.  
✔ **Automated Query Execution** – Executes queries in **parallel** where possible, reducing execution time.  
✔ **Dependency Resolution** – Handles queries with **cross-step dependencies** dynamically.  
✔ **CTE-Based Query Merging** – Combines multiple SQL queries into a **single CTE-based query**.  
✔ **Caching System** – Stores query results in **memory** to avoid redundant executions.  
✔ **Error Handling & Self-Reflection** – Ensures query correctness through AI **self-reflection mechanisms**.

---

## **📁 Project Structure**

```
/ai-sql-query-system
│── /src
│   ├── index.ts              # Entry point of the application
│   ├── llm.ts                # LLM API integration
│   ├── queryExecutor.ts      # Executes SQL queries
│   ├── queryMerger.ts        # Merges multiple SQL queries into one using CTEs
│   ├── caching.ts            # Implements in-memory caching
│   ├── types.ts              # TypeScript type definitions
│── /db
│   ├── database.sqlite       # SQLite database file
│── README.md                 # Project documentation
│── package.json              # Dependencies and scripts
│── tsconfig.json             # TypeScript configuration
```

---

## **🛠️ Installation & Setup**

### **1️⃣ Clone the repository**

```bash
git clone https://github.com/your-repo/ai-sql-query-system.git
cd ai-sql-query-system
```

### **2️⃣ Install dependencies**

```bash
npm install
```

### **3️⃣ Set up your environment**

Create a `.env` file and add:

```
OPENAI_API_KEY=your-api-key
DATABASE_PATH=./db/database.sqlite
```

### **4️⃣ Start the application**

```bash
npm start
```

---

## **🧠 How It Works**

### **Step 1: AI Generates SQL Queries**

- The LLM receives a **natural language question**.
- It **breaks it down** into multiple **reasoning steps**.
- It generates **SQL queries** for each step.
- Each step is **labeled with dependencies** (`depends_on_previous: true/false`).

#### **Example LLM Response:**

```json
{
  "steps": [
    {
      "step": 1,
      "chain_of_thought": "We need to find the highest revenue customer segment.",
      "sub_question": "What is the total revenue for each customer segment?",
      "depends_on_previous": false,
      "sql_query": "SELECT segment, SUM(Orders.quantity * Products.price) AS revenue FROM Customers JOIN Orders ON Customers.id = Orders.user_id JOIN Products ON Orders.product_id = Products.id GROUP BY segment ORDER BY revenue DESC;"
    },
    {
      "step": 2,
      "chain_of_thought": "Now, we need to check revenue trends over time for the top segment.",
      "sub_question": "How has the revenue for the top customer segment changed over time?",
      "depends_on_previous": true,
      "sql_query": "SELECT Orders.order_date, SUM(Orders.quantity * Products.price) AS revenue FROM Orders JOIN Customers ON Orders.user_id = Customers.id JOIN Products ON Orders.product_id = Products.id WHERE Customers.segment = {previous_result} GROUP BY Orders.order_date ORDER BY Orders.order_date ASC;"
    }
  ]
}
```

---

### **Step 2: Query Execution**

- Independent queries (`depends_on_previous: false`) run **in parallel**.
- Dependent queries (`depends_on_previous: true`) **wait for previous results** before execution.
- Results are **stored in cache** for fast retrieval.

#### **Code Example:**

```typescript
const executeSQLQueries = async (steps: ReasoningStep[]) => {
  const results: Record<number, any> = {};

  for (const step of steps) {
    let query = step.sql_query || "";

    if (step.depends_on_previous) {
      const previousStep = steps[step.step - 2]; // Get the previous step
      const previousResult = results[previousStep.step];
      query = query.replace("{previous_result}", previousResult);
    }

    const result = await runSQLQuery(query);
    results[step.step] = result;
  }

  return results;
};
```

---

### **Step 3: Merging SQL Queries with CTEs**

- Instead of running multiple separate queries, we **merge them into a single query using CTEs**.
- This **improves performance** and **reduces query execution time**.

#### **Merged SQL Query Example:**

```sql
WITH
Step1 AS (
    SELECT segment, SUM(Orders.quantity * Products.price) AS revenue
    FROM Customers
    JOIN Orders ON Customers.id = Orders.user_id
    JOIN Products ON Orders.product_id = Products.id
    GROUP BY segment
    ORDER BY revenue DESC
),
Step2 AS (
    SELECT Orders.order_date, SUM(Orders.quantity * Products.price) AS revenue
    FROM Orders
    JOIN Customers ON Orders.user_id = Customers.id
    JOIN Products ON Orders.product_id = Products.id
    WHERE Customers.segment = (SELECT segment FROM Step1 LIMIT 1)
    GROUP BY Orders.order_date
    ORDER BY Orders.order_date ASC
)
SELECT * FROM Step2;
```

#### **How It Works:**

1️⃣ `Step1` finds the **top revenue customer segment**.  
2️⃣ `Step2` **analyzes revenue trends** for that segment.  
3️⃣ The **final `SELECT * FROM Step2;`** retrieves the insights.

---

## **⚡ Performance Optimizations**

✅ **Parallel Execution** – Runs independent queries **at the same time**.  
✅ **CTE Merging** – Combines multiple SQL queries into **one**.  
✅ **In-Memory Caching** – Stores recent query results to avoid re-running queries.  
✅ **AI Self-Reflection** – AI checks its own SQL before execution to **correct issues**.

---

## **💡 Future Enhancements**

🔹 **Support for more databases (PostgreSQL, MySQL, etc.)**  
🔹 **Automatic query optimization (indexing, query tuning, etc.)**  
🔹 **More advanced AI reasoning (multi-step inference chains)**  
🔹 **Interactive web-based UI for query generation**

---

### **🚀 Final Notes**

This project **combines AI reasoning with database querying**, allowing users to extract **insights from structured data using natural language**. By leveraging **CTEs, caching, and optimized execution**, it **bridges AI with database analytics** efficiently.

---

## need to do

- need to test executeSQLQueries and combineSQLQueriesUsingCTEs
- need to test combineSQLQueriesUsingCTEs
- add error handling , for case when need more data
