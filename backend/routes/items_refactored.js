import express from "express";
import fs from "fs";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { 
  createNewItemNotifications, 
  createClaimNotification 
} from "../services/notificationService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      location,
      category,
      dateFound,
      userId,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.location = location;
    }

    if (category) {
      filter.category = category;
    }

    if (dateFound) {
      filter.dateFound = dateFound;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await itemsCollection.countDocuments(filter);

    const items = await itemsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      items,
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

/**
 * REFACTOR APPLIED: Using validateObjectId middleware
 * BENEFIT: Cleaner route handler, validation logic centralized
 */
router.get("/:id", validateObjectId('id'), async (req, res, next) => {
  try {
    const id = req.validatedIds.id;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: id });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * REFACTOR APPLIED: Extracted notification logic to service layer
 * BEFORE: 30+ lines of notification code embedded in route handler
 * AFTER: Single function call, route focuses on item creation
 */
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { name, location, description, dateFound, category, status } =
        req.body;

      if (!name || !location || !description || !dateFound || !category) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }
        return res.status(400).json({ message: "Missing required fields." });
      }

      const db = await getDb();
      const itemsCollection = db.collection("Items");

      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      const newItem = {
        userId: req.userId,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        dateFound,
        category: category.trim(),
        image: imagePath,
        status: status || "searching",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      const itemId = result.insertedId.toString();

      // REFACTORED: Clean service call instead of embedded logic
      await createNewItemNotifications(itemId, newItem, req.userId);

      res.status(201).json({
        message: "Item created successfully.",
        itemId: result.insertedId,
        item: { ...newItem, _id: result.insertedId },
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }
      next(error);
    }
  }
);

/**
 * REFACTOR APPLIED: Using validateObjectId middleware + notification service
 * BENEFIT: Route handler is 20+ lines shorter and more readable
 */
router.put("/:id", authenticate, validateObjectId('id'), async (req, res, next) => {
  try {
    const id = req.validatedIds.id;
    const { name, location, description, dateFound, category, image, status } =
      req.body;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: id });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const isClaimingItem = status === "claimed" && item.status !== "claimed";
    const isOwner = item.userId === req.userId;

    if (!isClaimingItem && !isOwner) {
      return res
        .status(403)
        .json({ message: "You can only update your own items." });
    }

    if (isClaimingItem && !isOwner) {
      if (
        name ||
        location ||
        description ||
        dateFound ||
        category ||
        image !== undefined
      ) {
        return res.status(403).json({
          message:
            "You can only claim items. Only the owner can update other fields.",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();
    if (description) updateData.description = description.trim();
    if (dateFound) updateData.dateFound = dateFound;
    if (category) updateData.category = category.trim();
    if (image !== undefined) updateData.image = image;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    updateData.updatedAt = new Date();

    const result = await itemsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    // REFACTORED: Clean service call for claim notifications
    if (isClaimingItem && item.userId !== req.userId) {
      await createClaimNotification(id.toString(), item, item.userId);
    }

    res.json({ message: "Item updated successfully." });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, validateObjectId('id'), async (req, res, next) => {
  try {
    const id = req.validatedIds.id;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: id });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.userId !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own items." });
    }

    const result = await itemsCollection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    next(error);
  }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const items = await itemsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(items);
  } catch (error) {
    next(error);
  }
});

export default router;
