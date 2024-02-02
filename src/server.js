import express from "express";
import cors from "cors";
import joi from "joi";

const server = express();
server.use(cors());
server.use(express.json());

let users = [];
let tweets = [];

const userSchema = joi.object({
  username: joi.string().required().min(3),
  avatar: joi.string().required(),
});

const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required(),
});

server.post("/sign-up", (req, res) => {
  const username = req.body.username;
  const avatar = req.body.avatar;

  const userInfo = { username, avatar };
  const validation = userSchema.validate(userInfo, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  users.push(userInfo);

  return res.status(201).send("Created!");
});

server.post("/tweets", (req, res) => {
  const username = req.body.username;
  const tweet = req.body.tweet;

  const isSignedUp = users.find((user) => {
    return user.username === username;
  });

  if (!isSignedUp) {
    return res.status(401).send("UNAUTHORIZED!");
  }

  const userTweet = { username, tweet };

  const validation = tweetSchema.validate(userTweet, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  tweets.push(userTweet);

  return res.status(201).send("OK!");
});

server.get("/tweets", (req, res) => {
  const usersTweets = tweets.map((tweet) => {
    const userInfo = users.find((user) => user.username === tweet.username);
    return {
      username: tweet.username,
      avatar: userInfo.avatar,
      tweet: tweet.tweet,
    };
  });

  if (usersTweets.length <= 10) return res.send(usersTweets.reverse());

  return res.send(usersTweets.reverse().slice(0, 10));
});

server.get("/tweets/:username", (req, res) => {
  const username = req.params.username;

  const userTweets = tweets
    .filter((tweet) => tweet.username === username)
    .map((tweet) => {
      const userInfo = users.find((user) => user.username === tweet.username);
      return {
        username: tweet.username,
        tweet: tweet.tweet,
        avatar: userInfo.avatar,
      };
    });

  return res.send(userTweets);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
