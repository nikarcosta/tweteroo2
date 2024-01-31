import express from "express";

const server = express();
server.use(express.json());

let users = [];

server.post("/sign-up", (req, res) => {
  let userName = req.body.username;
  let userAvatar = req.body.avatar;

  if (userName === "" || userAvatar === "") {
    res.send("Preencha todos os campos!");
  }

  let userInfo = { userName, userAvatar };
  users.push(userInfo);

  res.send(users);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
