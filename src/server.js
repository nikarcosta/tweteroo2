import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import tweetsRouter from "./routes/tweetsRoutes.js";

const server = express();
server.use(cors());
server.use(express.json());
server.use([authRouter, tweetsRouter]);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
