import { ObjectId } from "mongodb";
import db from "../config/database.js";

export async function postTweets(req, res) {
  const { username, tweet } = req.body;

  try {
    const userExists = await db.collection("users").findOne({ username });
    if (!userExists)
      return res.status(404).send("UNAUTHORIZED!User doesn't exist!");

    await db.collection("tweets").insertOne({ username, tweet });

    return res.status(201).send("Ok!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function getTweets(_, res) {
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
}

export async function getTweetsByUsername(req, res) {
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
}

export async function deleteTweets(req, res) {
  const { id } = req.params;

  try {
    const result = await db
      .collection("tweets")
      .deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send("Tweet not found!");
    }
    return res.status(202).send("Tweet deleted successfully!");
  } catch (err) {
    console.error("Error deleting tweet:", err);
    return res.status(500).send(err.message);
  }
}

export async function updateTweets(req, res) {
  const { id } = req.params;

  try {
    const tweet = await db
      .collection("tweets")
      .findOne({ _id: ObjectId.createFromHexString(id) });

    if (!tweet) {
      return res.status(404).send("Tweet not found!");
    }

    await db
      .collection("tweets")
      .updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: req.body });

    return res.status(200).send("Tweet updated successfully!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
