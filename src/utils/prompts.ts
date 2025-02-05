interface ICreateCompletePrompt {
  userPrompt: string;
}

export const createCompletePrompt = (prams: ICreateCompletePrompt): string => {
  return "dfsdf";
};

export const breakPromptToMachinePrompt = (
  userPrompt: string,
  tables_context: unknown
) => {
  const role_base =
    "You are a virtual data scientist and you need to act like human data scientist.";
  const gratitude = "please do the following task";
  const main_task = `**take the following sentence and convert it to SQL Query use the context of the relationships between the tables, create 3 sql query that you think can answer the question, then pick one of them that you think is the best one and return it as you answer **: ${userPrompt}  `;
  const context_explain =
    "the following context contain all of the tables and there structure, and the relation between them";
  const context = `context: ${tables_context}`;
  const chain_of_thought = "break the prompt to smaller logical prompt";
  const examples = `
  example 1: 
    NLP_TEXT: "Find all users in the database".
    ANSWER: "SELECT * FROM Users;"
  
    example 2: 
    NLP_TEXT: "Retrieve the orders made by the user with the name 'Alice'".
    ANSWER: "SELECT Orders.id, Orders.quantity, Products.name AS product_name FROM Orders JOIN Users ON Orders.user_id = Users.id JOIN Products ON Orders.product_id = Products.id WHERE Users.name = 'Alice';"
  
    example 3: 
    NLP_TEXT: "Show the total quantity of products ordered for each user".
    ANSWER: "SELECT Users.name AS user_name, SUM(Orders.quantity) AS total_quantity FROM Orders JOIN Users ON Orders.user_id = Users.id GROUP BY Users.name;"
  
    example 4: 
    NLP_TEXT: "Find the names of users who have ordered products costing more than $1000".
    ANSWER: "SELECT DISTINCT Users.name FROM Orders JOIN Users ON Orders.user_id = Users.id JOIN Products ON Orders.product_id = Products.id WHERE Products.price > 1000"
  
    example 5: 
    NLP_TEXT: "Get the name of each user along with the total cost of all their orders, but only include users whose total cost is greater than $1500".
    ANSWER: "SELECT Users.name AS user_name, SUM(Products.price * Orders.quantity) AS total_cost FROM Orders JOIN Users ON Orders.user_id = Users.id JOIN Products ON Orders.product_id = Products.id GROUP BY Users.name HAVING total_cost > 1500;"
  `;
  const formatting =
    "return as JSON object as following: { sql_query:'just the sql query you constructed'} ";

  const fall_back =
    "in case you didn't underspend the commend input or you are not manged to break it, return 'i didn't to do this action.'";
  const self_reflection = "print your reasoning process along you answer";

  const complete_prompt = `
  ${role_base},
  ${gratitude},
  ${main_task},
  ${context_explain},
  ${context},
  ${chain_of_thought},
  ${examples},
  ${formatting},
  ${fall_back},
  ${main_task},
  ${self_reflection},
  `;

  return complete_prompt;
};

// things that need to beeing implement in the comment

// role base - You are a virtual data scientist and you need to act like human data scientist.
//gratitude - please do the following task
// todo : main task -
// todo : context - provided the data as context
// todo :  chain of thought - break the prompt to smaller logical prompt
// todo : add shots
// formatting - return as JSON object
// fall back - in case you didn't underspend the commend input or you are not manged to break it, return "i didnt to do this action".
//todo : repeat of the main task
// self-reflection - print your reasoning process along you answer .

// ! template for effective prompt

// role base - You are a virtual ___ and you need to act like human ____.
//gratitude - please do the following task
// todo : main task - ___
// todo : context - provided the data as context
// chain of thought - break the prompt to smaller logical prompt
// todo : add shots
// formatting - return as JSON object
// fall back - in case you didn't underspend the commend input or you are not manged to break it, return "i didnt to do this action".
//todo : repeat of the main task - ____
// self-reflection - print your reasoning process along you answer .

export const breakPromptToReasoningTasks = (
  userPrompt: string,
  tables_context: unknown
) => {
  const role_base =
    "You are an advanced SQL data analyst and reasoning expert.";
  const general_task =
    "Your job is to break down complex business questions into logical sub-questions and immediately generate SQL queries to answer them.";
  const gratitude = "please do the following task";
  const context_explain =
    "the following context contain all of the tables and there structure, and the relation between them";
  const context = `context: ${tables_context}`;

  const main_question = `given question: ${userPrompt}.`;
  const task_title = "**Task:**";
  const main_task = `
1. **Break down** the given question into **multiple logical sub-questions** that will help fully answer it.  
2. **For each sub-question**, generate an **optimized SQL query** to retrieve the required data.  
3. Identify **dependencies** between queries (e.g., does one query require results from another?).  
4. **Label each sub-question** with '"depends_on_previous": true' if it relies on a previous query.  
5. **Return the response in JSON format** as shown below.`;

  const fall_back = ` **Fallback Handling:**  
   - If a sub-question **cannot** be answered with SQL, explain **why** and provide suggestions.  
   - If the input question is **unclear or incomplete**, return '"fallback": "Question is ambiguous. Please clarify details such as time range, user segment, or specific products."'  
`;

  const chain_of_thought = `
  **Analyze the question step-by-step (Chain of Thought)**  
   - Think **out loud** before generating queries.  
   - Explain why each sub-question is important for answering the main question.`;
  const examples = `
  **Example 1:**  
**Input Question:**  
*"Which product should I try to sell more of to increase sales?"*  

**Expected Output:**  
{
  "steps": [
    {
      "step": 1,
      "chain_of_thought": "To determine which product should be prioritized for sales, we first need to identify the top-selling products in the last 6 months.",
      "sub_question": "Which product has the highest sales in the last 6 months?",
      "depends_on_previous": false,
      "sql_query": "SELECT product_id, SUM(units_sold) AS total_sales FROM Sales_Trends WHERE date >= DATE('now', '-6 months') GROUP BY product_id ORDER BY total_sales DESC LIMIT 1;"
    },
    {
      "step": 2,
      "chain_of_thought": "Now that we know which product sells the most, we need to check how much revenue it generated to ensure profitability.",
      "sub_question": "What is the total revenue of this product?",
      "depends_on_previous": true,
      "sql_query": "SELECT SUM(Orders.quantity * Products.price) AS total_revenue FROM Orders JOIN Products ON Orders.product_id = Products.id WHERE Orders.product_id = {previous_result};"
    },
    {
      "step": 3,
      "chain_of_thought": "If the question was asking about profit instead of sales, we would also need to check product costs, but we don't have cost data in this schema.",
      "sub_question": "What is the total profit generated by this product?",
      "depends_on_previous": false,
      "fallback": "Cannot calculate profit because the database does not store product cost data."
    }
  ]
}


Example 2:**  
**Input Question:**  
*"Which customer segment is responsible for the highest revenue?"*  

**Expected Output:**  

{
  "steps": [
    {
      "step": 1,
      "chain_of_thought": "To identify the most profitable customer segment, we first need to group customers by their segment and sum their total spending.",
      "sub_question": "What is the total revenue generated by each customer segment?",
      "depends_on_previous": false,
      "sql_query": "SELECT Customers.segment, SUM(Orders.quantity * Products.price) AS total_revenue FROM Orders JOIN Customers ON Orders.user_id = Customers.id JOIN Products ON Orders.product_id = Products.id GROUP BY Customers.segment ORDER BY total_revenue DESC;"
    },
    {
      "step": 2,
      "chain_of_thought": "Now that we have the most profitable segment, let's check if it has a consistent revenue stream over the past year.",
      "sub_question": "How has the revenue of the top customer segment changed over the past year?",
      "depends_on_previous": true,
      "sql_query": "SELECT Orders.order_date, SUM(Orders.quantity * Products.price) AS revenue FROM Orders JOIN Customers ON Orders.user_id = Customers.id JOIN Products ON Orders.product_id = Products.id WHERE Customers.segment = {previous_result} GROUP BY Orders.order_date ORDER BY Orders.order_date ASC;"
    }
  ]
}
  `;
  const formatting = `return as JSON object as with the following format as the occording interface :

  interface ReasoningStep {
  step: number;  // Step order in sequence
  chain_of_thought: string;  // Explanation of why this step is important
  sub_question: string;  // The sub-question being asked
  depends_on_previous: boolean;  // If this step relies on a previous query
  sql_query: string | null;  // The SQL query for this step (if possible)
  fallback: string | null;  // If SQL cannot be generated, an explanation
}

// Self-reflection section to ensure correctness
interface SelfReflection {
  issues_identified: string;  // Problems found in the generated response
  improvements_made: string;  // Adjustments to improve accuracy
}

// Complete LLM Response Structure
interface LLMResponse {
  steps: ReasoningStep[];  // Array of reasoning steps
  self_reflection: SelfReflection;  // Self-check to refine results
} `;

  const self_reflection = `****Self-Reflection:**  
   - After generating the JSON response, evaluate if the queries **fully answer** the question.  
   - If the breakdown is incomplete or redundant, refine the sub-questions and try again.  
   - Ensure the final output is **valid JSON** and follows the strict format below.  
.`;

  const complete_prompt = `
${role_base},
${general_task},
${gratitude},
${context_explain},
${context},

${task_title},
${main_task},
${chain_of_thought},
${fall_back},
${self_reflection},
${examples},

${formatting},
${main_task},
`;

  return complete_prompt;
};
