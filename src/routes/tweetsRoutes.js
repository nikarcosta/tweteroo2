import {
  postTweets,
  getTweets,
  getTweetsByUsername,
} from "../controllers/tweetsController.js";
import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { authValidation } from "../middlewares/authMiddleware.js";
import { tweetSchema } from "../schemas/tweetsSchema.js";

const tweetsRouter = Router();

tweetsRouter.post(
  "/tweets",
  validateSchema(tweetSchema),
  authValidation,
  postTweets
);
tweetsRouter.get("/tweets", authValidation, getTweets);
tweetsRouter.get("/tweets/:username", authValidation, getTweetsByUsername);
tweetsRouter.post("/tweets", authValidation, postTweets);

export default tweetsRouter;
