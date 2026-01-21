import { Request, Response } from "express";
import Task from "../models/Task.model";
import User from "../models/User.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;

    let matchStage: any = {};
    if (role === "member") {
      matchStage.assignedUsers = userId;
    }

    // Tasks per stage
    const tasksByStage = await Task.aggregate([
      { $match: matchStage },
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
    ]);

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...matchStage,
      dueDate: { $lt: new Date() },
      currentStage: { $ne: "Done" },
    });

    // Average completion time per workflow
    const avgCompletionTime = await Task.aggregate([
      { $match: { completedAt: { $exists: true } } },
      {
        $group: {
          _id: "$workflowId",
          avgCompletionTime: {
            $avg: {
              $subtract: ["$completedAt", "$createdAt"],
            },
          },
        },
      },
    ]);

    // Tasks completed per user
    const tasksCompletedPerUser = await Task.aggregate([
      { $match: { completedAt: { $exists: true } } },
      { $unwind: "$assignedUsers" },
      {
        $group: {
          _id: "$assignedUsers",
          completedTasks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          completedTasks: 1,
        },
      },
    ]);

    res.json({
      tasksByStage,
      overdueTasks,
      avgCompletionTime,
      tasksCompletedPerUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
