import db from "../config/database.js";

export async function authValidation(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(404).send("Token missing!");

  try {
    const checkSession = await db.collection("sessions").findOne({ token });

    if (!checkSession) return res.sendStatus(401);

    res.locals.session = checkSession; //here, it saves token & userId in the variable res.locals.session to be accessible anywhere in the code; res.locals.{yourVariablehere}

    next();
  } catch (err) {
    return res.status(500).send(err.messages);
  }
}
