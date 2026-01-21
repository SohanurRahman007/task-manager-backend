import express from "express";
import {
  createWorkflow,
  getWorkflows,
  updateWorkflowStages,
  deleteWorkflow,
} from "../controllers/workflow.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "../types";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  createWorkflow,
);
router.get("/", authenticate, getWorkflows);
router.put(
  "/:id/stages",
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  updateWorkflowStages,
);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteWorkflow);

export default router;
