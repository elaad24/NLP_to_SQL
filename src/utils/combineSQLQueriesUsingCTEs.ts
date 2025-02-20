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

export interface LLMResponse {
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
 * Combines multiple SQL queries into a single CTE SQL query.
 * Supports {previous_result} placeholders by injecting the correct subquery.
 */
export function combineSQLQueriesUsingCTEs(llmResponse: LLMResponse): string {
  const cteQueries: string[] = [];

  for (let i = 0; i < llmResponse.steps.length; i++) {
    let step = llmResponse.steps[i];
    let query = step.sql_query?.trim() || "";

    // Step 1 should not depend on a previous step
    if (step.depends_on_previous && i === 0) {
      throw new Error("Error: Step 1 cannot depend on a previous result.");
    }

    // Handle dependent queries
    if (step.depends_on_previous) {
      // Construct the subquery to replace {previous_result}
      const subquery = `(SELECT category_id FROM Step_${i} LIMIT 1)`;

      // Replace all placeholders with the correct subquery
      query = query.replaceAll("{previous_result.category_id}", subquery);
    }

    // Format CTE names consistently
    cteQueries.push(`Step_${i + 1} AS (\n  ${query} \n)`);
  }

  // Create the combined CTE query
  const withClause = `WITH \n${cteQueries.join(",\n")}\n`;
  const finalQuery =
    withClause + `SELECT * FROM Step_${llmResponse.steps.length};`;

  return finalQuery;
}
