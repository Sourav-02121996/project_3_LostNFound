import express from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { generateToken } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

const SALT_ROUNDS = 10;

router.post("/", async (req, res, next) => {
  try {
    const { nuid, name, phone, email, password } = req.body;

    if (!nuid || !name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const newUserData = {
      nuid: nuid.trim(),
      name: name.trim(),
      phone: phone.trim(),
      email: normalizedEmail,
    };

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      ...newUserData,
      passwordHash,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: "Account created successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const normalizedEmail = email.trim().toLowerCase();

    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * REFACTOR APPLIED: Using validateObjectId middleware
 * BEFORE: Manual validation with if (!userId) and if (!ObjectId.isValid(userId))
 * AFTER: Middleware handles validation, cleaner route handler
 */
router.get("/profile", validateObjectId('userId', 'query'), async (req, res, next) => {
  try {
    // Use pre-validated ObjectId from middleware
    const userId = req.validatedIds.userId;

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

/**
 * REFACTOR APPLIED: Extracted validation logic
 * BENEFIT: Route handler focuses on business logic, not validation boilerplate
 */
router.put("/profile", async (req, res, next) => {
  try {
    const { userId, nuid, name, phone, email } = req.body;

    // Manual validation still needed here since userId comes from body
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const updateData = {};
    if (nuid) updateData.nuid = nuid.trim();
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    updateData.updatedAt = new Date();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
});

router.put("/password", async (req, res, next) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "User ID, current password, and new password are required.",
      });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
