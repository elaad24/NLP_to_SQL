import express, { Request, Response } from "express";
import botRoutes from "./routes/bot";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Use the bot router
app.use("/bot", botRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
