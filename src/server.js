import express from "express";
import cors from "cors";
import joi from "joi";
import db from "./config/database.js";

const server = express();
server.use(cors());
server.use(express.json());

server.get("/tweets", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(404).send("Token missing!");

  const session = await db.collection("sessions").findOne({ token });

  if (!session) return res.sendStatus(401);

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
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(404).send("Token missing!");

  const session = await db.collection("sessions").findOne({ token });

  if (!session) return res.sendStatus(401);

  try {
    const tweets = await db.collection("tweets").find({ username }).toArray();
    if (!tweets) return res.status(404).send([]);

    const userInfo = await db.collection("users").findOne({ username });

    if (!userInfo) return res.status(404).send([]);

    const userTweets = tweets.map((tweet) => {
      return {
        username: tweet.username,
        tweet: tweet.tweet,
        avatar: userInfo.avatar,
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
