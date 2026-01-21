import { Response } from "express";
import User from "../models/User.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}, "-password -refreshToken");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id, "-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
