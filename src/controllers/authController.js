import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../config/database";

export async function signUp(req, res) {
  const { email, username, password, avatar } = req.body;

  try {
    const userExists = await db
      .collection("users")
      .findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      if (userExists.username === username) {
        return res.status(404).send("Username already exists!");
      } else {
        return res.status(404).send("Email is already in use!");
      }
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await db.collection("users").insertOne({
      email: email,
      username: username,
      password: passwordHash,
      avatar: avatar,
    });

    return res.status(201).send("User created successfully!");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function signIn(req, res) {
  const { username, password } = req.body;

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
}
