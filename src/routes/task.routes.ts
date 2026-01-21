import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTask,
} from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "../types";

const router = express.Router();

router.post("/", authenticate, createTask);
router.get("/", authenticate, getTasks);
router.get("/:id", authenticate, getTaskById);
router.put("/:id", authenticate, updateTask);
router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  deleteTask,
);
router.patch("/:id/move", authenticate, moveTask);

export default router;
