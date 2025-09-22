import type { Request, Response } from "express";
import User from "../models/User.js";
import { createUserSchema } from "../validators/users.validator.js";


// POST /users
export async function createUser(req: Request, res: Response) {
  const { error, value } = createUserSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res.status(400).json({ error: error.details.map((d) => d.message) });

  try {
    const user = await User.create(value);
    return res.status(201).json(user);
  } catch (err: any) {
    console.error("createUser error", err);
    if (err.code === 11000)
      return res.status(400).json({ error: "username_already_exists" });
    return res.status(500).json({ error: "internal_server_error" });
  }
}
