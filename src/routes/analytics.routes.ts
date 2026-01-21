import express from "express";
import { getDashboardStats } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/dashboard", authenticate, getDashboardStats);

export default router;
