"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakPromptToMachinePrompt = exports.createCompletePrompt = void 0;
const createCompletePrompt = (prams) => {
    return "dfsdf";
};
exports.createCompletePrompt = createCompletePrompt;
const breakPromptToMachinePrompt = (userPrompt, tables_context) => {
    const role_base = "You are a virtual data scientist and you need to act like human data scientist.";
    const gratitude = "please do the following task";
    const main_task = `**take the following sentence and convert it to SQL Query use the context of the relationships between the tables, create 3 sql query that you think can answer the question, then pick one of them that you think is the best one and return it as you answer **: ${userPrompt}  `;
    const context_explain = "the following context contain all of the tables and there structure, and the relation between them";
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
    const formatting = "return as JSON object as following: { sql_query:'just the sql query you constructed'} ";
    const fall_back = "in case you didn't underspend the commend input or you are not manged to break it, return 'i didn't to do this action.'";
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
exports.breakPromptToMachinePrompt = breakPromptToMachinePrompt;
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
