import joi from "joi";

export const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required(),
});
