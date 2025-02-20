import { Router, Request, Response } from "express";
import axios from "axios";
import {
  breakPromptToMachinePrompt,
  breakPromptToReasoningTasks,
  createCompletePrompt,
} from "../utils/prompts";

import tableRelations from "../../db/table_relations.json";
import { executeSQLQueries } from "../utils/executeSQLQueries";
import {
  combineSQLQueriesUsingCTEs,
  LLMResponse,
} from "../utils/combineSQLQueriesUsingCTEs";
import { sendChatGPTRequest } from "../utils/sendDataToGpt";

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
router.post("/basic", async (req: Request, res: Response) => {
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
// ! need to test executeSQLQueries  and combineSQLQueriesUsingCTEs
router.post("/advanced", async (req: Request, res: Response) => {
  const userPrompt = req.body?.prompt;
  if (userPrompt == undefined) {
    res.status(400).json({ text: "prompt text is required" });
  }
  const fullPrompt = breakPromptToReasoningTasks(userPrompt, tableRelations);
  const gptResponse = await sendChatGPTRequest({ prompt: fullPrompt });
  console.log("gptResponse", gptResponse);

  const ans = combineSQLQueriesUsingCTEs(gptResponse);
  console.log("sqlCombined", ans);
  res.status(200).json({ sqlCombined: ans, fullPrompt });

  // try {
  // let response = await axios.post(
  //   botServerEndpoint,
  //   {
  //     model: "llama3.2",
  //     prompt: prompt,
  //     stream: false,
  //   },
  //   {
  //     headers: { "Content-Type": "application/json" },
  //   }
  // );
  // console.log("response ", response.data);
  // return an answer for the query
  // const ans = executeSQLQueries(response.data);

  //return an combined query

  // console.log(ans);

  // res.status(200).json(ans);
  // } catch (error) {
  // console.error("the request has failed ", error);
  // }
});
router.post(
  "/combineSQLQueriesUsingCTEs",
  async (req: Request, res: Response) => {
    const data = req.body?.data;
    if (data == undefined) {
      res.status(400).json({ text: "data text is required" });
    }

    const ans = combineSQLQueriesUsingCTEs(data);
    console.log("sqlCombined", ans);
    res.status(200).json({ sqlCombined: ans });
  }
);

export default router;
