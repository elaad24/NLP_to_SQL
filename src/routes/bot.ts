import { Router, Request, Response } from "express";
import axios from "axios";
import {
  breakPromptToMachinePrompt,
  createCompletePrompt,
} from "../utils/prompts";

import tableRelations from "../../db/table_relations.json";

const router = Router();
const botServerPortNumber = "11434";
const botServerEndpoint = `http://127.0.0.1:${botServerPortNumber}/api/generate`;

// Define an endpoint
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from the bot route!" });
});

// Add more endpoints if needed
// router.post("/", (req: Request, res: Response) => {
//   const { name } = req.body;
//   res.json({ message: `Hello, ${name || "bot"}!` });
// });

// endpoint - offline actions allowed ,

// Add more endpoints if needed
router.post("/", async (req: Request, res: Response) => {
  const userPrompt = req.body?.prompt;
  if (userPrompt == undefined) {
    res.status(400).json({ text: "prompt text is required" });
  }

  // need to take the user prompt and split it to with the llmama and return
  // the spited and chewed userPrompt and give it to the CompletePromptFunction

  const prompt = breakPromptToMachinePrompt(userPrompt, tableRelations);
  try {
    let response = await axios.post(
      botServerEndpoint,
      {
        model: "llama3.2",
        prompt: prompt,
        stream: false,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("response ", response.data);

    const rawResponse_parse = response.data.response
      .split("```json")[1]
      .split("```")[0];

    const jsonResponse = JSON.parse(rawResponse_parse.trim());

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("the request has failed ", error);
  }
});

export default router;
