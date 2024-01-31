import express from "express";

const server = express();
server.use(express.json());

let users = [];
let tweets = [];

server.post("/sign-up", (req, res) => {
  let username = req.body.username;
  let useravatar = req.body.avatar;

  if (username === "" || useravatar === "") {
    return res.send("Preencha todos os campos!");
  }

  let userInfo = { username, useravatar };
  users.push(userInfo);
  console.log(users);

  return res.send("Created!");
});

server.post("/tweets", (req, res) => {
  const username = req.body.username;
  const usertweet = req.body.tweet;

  const isSignedUp = users.find((user) => {
    return user.username === username;
  });

  if (!isSignedUp) {
    console.log(isSignedUp);
    return res.send("UNAUTHORIZED!");
  }

  const tweet = { username, usertweet };

  tweets.push(tweet);

  return res.send("OK!");
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
