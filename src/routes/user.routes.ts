import express from "express";
import { getUsers, getUserById } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "../types";

const router = express.Router();

router.get("/", authenticate, authorize(Role.ADMIN, Role.MANAGER), getUsers);
router.get("/:id", authenticate, getUserById);

export default router;
