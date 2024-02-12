import express from "express";
import cors from "cors";
import joi from "joi";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
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
  email: joi.string().email().required(),
  username: joi.string().required().min(3),
  password: joi.string().required().min(6),
  avatar: joi.string().required(),
});

const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required(),
});

const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});

server.post("/sign-up", async (req, res) => {
  const { email, username, password, avatar } = req.body;

  const userInfo = {
    email,
    username,
    password,
    avatar,
  };

  const validation = userSchema.validate(userInfo, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const userExists = await db
      .collection("users")
      .findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      if (userExists.username === userInfo.username) {
        return res.status(404).send("Username already exists!");
      } else {
        return res.status(404).send("Email is already in use!");
      }
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await db.collection("users").insertOne({
      email: userInfo.email,
      username: userInfo.username,
      password: passwordHash,
      avatar: userInfo.avatar,
    });

    return res.status(201).send("User created successfully!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

server.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;

  const userLogin = { username, password };

  const validation = loginSchema.validate(userLogin, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const userExists = await db.collection("users").findOne({ username });
    if (!userExists) return res.status(404).send("User doesn't exist!");

    if (userExists && bcrypt.compare(password, userExists.password)) {
      const token = uuid();

      await db
        .collection("sessions")
        .insertOne({ userId: userExists._id, token });

      const response = { message: "Welcome back", token };

      return res.status(200).send(response);
    } else {
      return res.status(401).send("Invalid username or password!");
    }
  } catch (err) {
    return req.status(500).send(err.message);
  }
});

server.post("/tweets", async (req, res) => {
  const { username, tweet } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(404).send("Token missing!");

  const session = await db.collection("sessions").findOne({ token });

  if (!session) return res.sendStatus(401);

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
