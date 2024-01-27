import express from "express";

const server = express();
server.use(express.json());

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT = ${PORT}.`);
});
