import {
  postTweets,
  getTweets,
  getTweetsByUsername,
} from "../controllers/tweetsController";
import { Router } from "express";
import { validateSchema, authMiddleware } from "../middlewares";
import { tweetSchema } from "../schemas/tweetsSchema";

const tweetsRouter = Router();

tweetsRouter.post(
  "/tweets",
  validateSchema(tweetSchema),
  authMiddleware,
  postTweets
);
tweetsRouter.get("/tweets", authMiddleware, getTweets);
tweetsRouter.get("/tweets/:username", authMiddleware, getTweetsByUsername);

export default tweetsRouter;
