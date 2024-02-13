import db from "./config/database.js";

export async function postTweets(req, res) {
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
}
