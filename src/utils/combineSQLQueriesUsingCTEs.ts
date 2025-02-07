// Define the interfaces (for reference)
interface ReasoningStep {
  step: number; // Step order in sequence
  chain_of_thought: string; // Explanation of why this step is important
  sub_question: string; // The sub-question being asked
  depends_on_previous: boolean; // If this step relies on a previous query
  sql_query: string | null; // The SQL query for this step (if possible)
  fallback: string | null; // If SQL cannot be generated, an explanation
}

interface SelfReflection {
  issues_identified: string; // Problems found in the generated response
  improvements_made: string; // Adjustments to improve accuracy
}

interface LLMResponse {
  steps: ReasoningStep[]; // Array of reasoning steps
  self_reflection: SelfReflection; // Self-check to refine results
}

/**
 * Helper function to extract the primary column name from a SELECT query.
 * It assumes that the first column in the SELECT clause is the one intended for use as a dependency.
 */
function extractPrimaryColumn(sql: string): string {
  // Look for the part between SELECT and the first comma.
  const selectRegex = /SELECT\s+([^,]+),/i;
  const match = sql.match(selectRegex);
  if (match && match[1]) {
    let colExpr = match[1].trim();
    // Check if there's an alias using "AS"
    const asRegex = /AS\s+(\w+)/i;
    const asMatch = colExpr.match(asRegex);
    if (asMatch && asMatch[1]) {
      return asMatch[1]; // Return the alias if available.
    } else {
      // Otherwise, if the column is in "Table.column" format, return the column name.
      const parts = colExpr.split(".");
      return parts[parts.length - 1].trim();
    }
  }
  // Fallback: if parsing fails, return a wildcard or a placeholder.
  return "*";
}

/**
 * This function combines the individual SQL queries from an LLMResponse into one SQL query using CTEs.
 * It assumes that if a step is marked as dependent, its SQL contains a placeholder {previous_result}
 * that should be replaced with a reference to the primary column from the previous step's CTE.
 */
export function combineSQLQueriesUsingCTEs(llmResponse: LLMResponse): string {
  const cteQueries: string[] = [];

  // Loop through each reasoning step.
  for (let i = 0; i < llmResponse.steps.length; i++) {
    const step = llmResponse.steps[i];
    let query = step.sql_query || "";

    // If the current step depends on the previous one, replace {previous_result}.
    if (step.depends_on_previous) {
      if (i === 0) {
        // This situation should not occur (step 1 cannot be dependent).
        console.error("Error: Step 1 cannot depend on a previous result.");
      } else {
        // Extract the primary column from the previous step's SQL.
        const prevStep = llmResponse.steps[i - 1];
        const primaryCol = extractPrimaryColumn(prevStep.sql_query || "");
        // Replace {previous_result} with a subquery that selects the primary column from the previous CTE.
        // Note: Here, we name our CTEs as Step1, Step2, etc.
        query = query.replace(
          "{previous_result}",
          `(SELECT ${primaryCol} FROM Step${i} LIMIT 1)`
        );
      }
    }

    // Wrap the (possibly modified) query as a CTE.
    cteQueries.push(`Step${i + 1} AS (\n  ${query}\n)`);
  }

  // Combine all the CTEs into one WITH clause.
  const withClause = `WITH\n${cteQueries.join(",\n")}\n`;

  // The final query selects all data from the last step.
  const finalQuery =
    withClause + `SELECT * FROM Step${llmResponse.steps.length};`;
  return finalQuery;
}
