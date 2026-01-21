import { Request, Response } from "express";
import Workflow from "../models/Workflow.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const createWorkflow = async (req: AuthRequest, res: Response) => {
  try {
    const { name, stages } = req.body;
    const userId = req.user!.userId;

    // Validate stages
    const stageOrders = stages.map((s: any) => s.order);
    const uniqueOrders = new Set(stageOrders);
    if (stageOrders.length !== uniqueOrders.size) {
      return res.status(400).json({ message: "Stage orders must be unique" });
    }

    const workflow = await Workflow.create({
      name,
      stages,
      createdBy: userId,
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const workflows = await Workflow.find()
      .populate("createdBy", "name email")
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWorkflowStages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stages } = req.body;

    const workflow = await Workflow.findById(id);
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    // Update stages
    workflow.stages = stages;
    await workflow.save();

    res.json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
