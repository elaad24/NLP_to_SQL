"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const prompts_1 = require("../utils/prompts");
const table_relations_json_1 = __importDefault(require("../../db/table_relations.json"));
const router = (0, express_1.Router)();
const botServerPortNumber = "11434";
const botServerEndpoint = `http://127.0.0.1:${botServerPortNumber}/api/generate`;
// Define an endpoint
router.get("/", (req, res) => {
    res.json({ message: "Hello from the bot route!" });
});
// Add more endpoints if needed
// router.post("/", (req: Request, res: Response) => {
//   const { name } = req.body;
//   res.json({ message: `Hello, ${name || "bot"}!` });
// });
// endpoint - offline actions allowed ,
// Add more endpoints if needed
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userPrompt = (_a = req.body) === null || _a === void 0 ? void 0 : _a.prompt;
    if (userPrompt == undefined) {
        res.status(400).json({ text: "prompt text is required" });
    }
    // need to take the user prompt and split it to with the llmama and return
    // the spited and chewed userPrompt and give it to the CompletePromptFunction
    const prompt = (0, prompts_1.breakPromptToMachinePrompt)(userPrompt, table_relations_json_1.default);
    try {
        let response = yield axios_1.default.post(botServerEndpoint, {
            model: "llama3.2",
            prompt: prompt,
            stream: false,
        }, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("response ", response.data);
        const rawResponse_parse = response.data.response
            .split("```json")[1]
            .split("```")[0];
        const jsonResponse = JSON.parse(rawResponse_parse.trim());
        res.status(200).json(jsonResponse);
    }
    catch (error) {
        console.error("the request has failed ", error);
    }
}));
exports.default = router;
