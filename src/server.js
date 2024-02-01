import express from "express";

const server = express();
server.use(express.json());

let users = [];
let tweets = [];

server.post("/sign-up", (req, res) => {
  let username = req.body.username;
  let avatar = req.body.avatar;

  if (username === "" || avatar === "") {
    return res.send("Preencha todos os campos!");
  }

  let userInfo = { username, avatar };
  users.push(userInfo);
  console.log(users);

  return res.send("Created!");
});

server.post("/tweets", (req, res) => {
  const username = req.body.username;
  const tweet = req.body.tweet;

  const isSignedUp = users.find((user) => {
    return user.username === username;
  });

  if (!isSignedUp) {
    console.log(isSignedUp);
    return res.send("UNAUTHORIZED!");
  }

  const userTweet = { username, tweet };

  console.log(userTweet);

  tweets.push(userTweet);

  return res.send("OK!");
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

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
