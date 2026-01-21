import { Request, Response } from "express";
import Task from "../models/Task.model";
import Workflow from "../models/Workflow.model";
import Notification from "../models/Notification.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, workflowId, assignedUsers, dueDate } =
      req.body;
    const userId = req.user!.userId;

    // Get workflow to get first stage
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const firstStage = workflow.stages.sort((a, b) => a.order - b.order)[0];

    const task = await Task.create({
      title,
      description,
      priority,
      currentStage: firstStage.name,
      assignedUsers,
      dueDate,
      workflowId,
      createdBy: userId,
      activityLog: [
        {
          action: "Task created",
          userId,
          details: { stage: firstStage.name },
        },
      ],
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const { stage, priority, assignedTo } = req.query;

    let query: any = {};

    // Members can only see assigned tasks
    if (role === "member") {
      query.assignedUsers = userId;
    }

    if (stage) {
      query.currentStage = stage;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedUsers = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate("assignedUsers", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newStage } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const task = await Task.findById(id).populate("workflowId");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is assigned to task or has higher permissions
    const isAssigned = task.assignedUsers.includes(userId);
    const canMove = userRole !== "member" || isAssigned;

    if (!canMove) {
      return res
        .status(403)
        .json({ message: "Not authorized to move this task" });
    }

    // Get workflow stages
    const workflow = await Workflow.findById(task.workflowId);
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const stages = workflow.stages.sort((a, b) => a.order - b.order);
    const currentStageIndex = stages.findIndex(
      (s) => s.name === task.currentStage,
    );
    const newStageIndex = stages.findIndex((s) => s.name === newStage);

    if (newStageIndex === -1) {
      return res.status(400).json({ message: "Invalid stage" });
    }

    // Validate stage order (can't skip stages)
    if (Math.abs(newStageIndex - currentStageIndex) > 1) {
      return res.status(400).json({ message: "Cannot skip stages" });
    }

    // Update task
    task.currentStage = newStage;
    task.activityLog.push({
      action: "Stage changed",
      userId,
      details: {
        from: task.currentStage,
        to: newStage,
        timestamp: new Date(),
      },
    });

    // Automation: If moving to Done, set completedAt and create notification
    if (newStage === "Done" || newStage.toLowerCase().includes("done")) {
      task.completedAt = new Date();

      // Create notifications for assigned users
      const notifications = task.assignedUsers.map((userId) => ({
        userId,
        message: `Task "${task.title}" has been completed`,
        taskId: task._id,
      }));

      await Notification.insertMany(notifications);
    }

    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
