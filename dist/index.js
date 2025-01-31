"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bot_1 = __importDefault(require("./routes/bot"));
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
// Use the bot router
app.use("/bot", bot_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
