import express from "express";
import cors from "cors";
import joi from "joi";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("twettero");
});

const userSchema = joi.object({
  username: joi.string().required().min(3),
  avatar: joi.string().required(),
});

const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required(),
});

server.post("/sign-up", async (req, res) => {
  //const username = req.body.username;
  //const avatar = req.body.avatar;
  const { username, avatar } = req.body;

  const userInfo = { username, avatar };
  const validation = userSchema.validate(userInfo, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const userExists = await db.collection("users").findOne({ username });
    if (userExists) return res.status(422).send("User already exists!");

    await db.collection("users").insertOne({ username, avatar });

    return res.status(201).send("Created!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

server.post("/tweets", async (req, res) => {
  //const username = req.body.username;
  //const tweet = req.body.tweet;
  const { username, tweet } = req.body;

  const userTweet = { username, tweet };

  const validation = tweetSchema.validate(userTweet, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const userExists = await db.collection("users").findOne({ username });
    if (!userExists)
      return res.status(404).send("UNAUTHORIZED!User doesn't exist!");

    await db.collection("tweets").insertOne({ username, tweet });

    return res.status(201).send("Ok!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

server.get("/tweets", async (req, res) => {
  try {
    const tweets = await db.collection("tweets").find().toArray();
    if (!tweets) return res.status(401).send([]);

    const users = await db.collection("users").find().toArray();
    if (!users) return res.status(401).send([]);

    const usersTweets = tweets.map((tweet) => {
      const userInfo = users.find((user) => user.username === tweet.username);
      return {
        username: tweet.username,
        avatar: userInfo.avatar,
        tweet: tweet.tweet,
      };
    });

    if (usersTweets.length <= 10) return res.send(usersTweets.reverse());

    return res.status(200).send(usersTweets.reverse().slice(0, 10));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

server.get("/tweets/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const tweets = await db.collection("tweets").find({ username }).toArray();
    if (!tweets) return res.status(404).send([]);

    const userInfo = await db.collection("users").find({ username }).toArray();
    console.log(userInfo);

    if (!userInfo || userInfo.length === 0) return res.status(404).send([]);

    const userTweets = tweets.map((tweet) => {
      return {
        username: tweet.username,
        tweet: tweet.tweet,
        avatar: userInfo[0].avatar,
      };
    });

    if (userTweets.length <= 10) return res.send(userTweets.reverse());

    res.status(200).send(userTweets.reverse().slice(0, 10));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
