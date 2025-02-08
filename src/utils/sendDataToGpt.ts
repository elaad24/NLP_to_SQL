import dotenv from "dotenv";

dotenv.config();

interface IsendDataToGpt {
  prompt: string;
}

import { OpenAI } from "openai";
import { LLMResponse } from "./combineSQLQueriesUsingCTEs";

const apiKey = process.env.CHAT_GPT_SECRET;
const openai = new OpenAI({
  apiKey: apiKey,
});

export async function sendChatGPTRequest({
  prompt,
}: IsendDataToGpt): Promise<LLMResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.2, // Adjust for creativity
      max_tokens: 300, // Limit response length
      frequency_penalty: 0.0, //  allow structured SQL generation without forcing variation
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content as unknown as LLMResponse;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to get response from OpenAI");
  }
}

// Example usage
// sendChatGPTRequest("Hello, ChatGPT! How are you?")
//   .then(response => console.log(response))
//   .catch(error => console.error(error));
