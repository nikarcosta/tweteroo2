import {
  postTweets,
  getTweets,
  getTweetsByUsername,
} from "../controllers/tweetsController";
import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema";
import { tweetSchema } from "../schemas/tweetsSchema";

const tweetsRouter = Router();

tweetsRouter.post("/tweets", validateSchema(tweetSchema), postTweets);
tweetsRouter.get("/tweets", getTweets);
tweetsRouter.get("/tweets/:username", getTweetsByUsername);

export default tweetsRouter;
