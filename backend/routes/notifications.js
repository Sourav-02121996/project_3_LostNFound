import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const router = express.Router();

// GET /api/notifications - Get all notifications for a user with pagination
router.get("/", async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await notificationsCollection.countDocuments({ userId });

    const notifications = await notificationsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const count = await notificationsCollection.countDocuments({
      userId,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true, readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json({ message: "Notification marked as read." });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read for a user
router.put("/read-all", async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const result = await notificationsCollection.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({
      message: "All notifications marked as read.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const result = await notificationsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json({ message: "Notification deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications - Create a new notification (typically done by system when new item is posted)
router.post("/", async (req, res, next) => {
  try {
    const {
      userId,
      itemId,
      itemName,
      itemLocation,
      itemImage,
      itemCategory,
      dateFound,
      type,
    } = req.body;

    if (!userId || !itemId) {
      return res
        .status(400)
        .json({ message: "User ID and item ID are required." });
    }

    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const newNotification = {
      userId,
      itemId,
      itemName: itemName || null,
      itemLocation: itemLocation || null,
      itemImage: itemImage || null,
      itemCategory: itemCategory || null,
      dateFound: dateFound || null,
      type: type || "new",
      read: false,
      createdAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(newNotification);

    res.status(201).json({
      message: "Notification created successfully.",
      notificationId: result.insertedId,
      notification: { ...newNotification, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
