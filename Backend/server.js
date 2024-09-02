import express from "express";
import cors from "cors";
import reviews from "./api/reviews.route.js";

const app = express();

console.log("Setting up middleware...");

app.use(cors());
app.use(express.json());

console.log("Setting up routes...");

app.use("/api/v1/reviews", reviews);

app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

console.log("Server setup complete.");

export default app;
