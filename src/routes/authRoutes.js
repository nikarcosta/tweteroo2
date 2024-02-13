import { signIn, signUp } from "../controllers/authController.js";
import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { userSchema, loginSchema } from "../schemas/authSchema.js";

const authRouter = Router();

authRouter.post("/sign-up", validateSchema(userSchema), signUp);
authRouter.post("/sign-in", validateSchema(loginSchema), signIn);

export default authRouter;
