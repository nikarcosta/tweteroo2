import joi from "joi";

export const userSchema = joi.object({
  email: joi.string().email().required(),
  username: joi.string().required().min(3),
  password: joi.string().required().min(6),
  avatar: joi.string().required(),
});

export const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});
