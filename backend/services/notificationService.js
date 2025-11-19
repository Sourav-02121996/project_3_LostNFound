import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

/**
 * REFACTOR: Extracted notification logic into a dedicated service layer
 * BEFORE: Notification creation was embedded in route handlers with try-catch blocks
 * AFTER: Centralized, testable, and reusable notification service
 * 
 * BENEFITS:
 * - Single Responsibility Principle: Routes handle HTTP, services handle business logic
 * - Easier to test in isolation
 * - Consistent notification creation across the app
 * - Better error handling and logging
 */

/**
 * Creates notifications for all users except the item creator
 * @param {string} itemId - The ID of the newly created item
 * @param {Object} itemData - Item details for the notification
 * @param {string} excludeUserId - User ID to exclude (item creator)
 * @returns {Promise<number>} Number of notifications created
 */
export async function createNewItemNotifications(itemId, itemData, excludeUserId) {
  try {
    const db = await getDb();
    const usersCollection = db.collection("Users");
    const notificationsCollection = db.collection("Notifications");

    // Fetch all users except the item creator
    const users = await usersCollection
      .find({ _id: { $ne: new ObjectId(excludeUserId) } })
      .toArray();

    if (users.length === 0) {
      console.log("No users to notify for new item:", itemId);
      return 0;
    }

    // Build notification documents
    const notifications = users.map((user) => ({
      userId: user._id.toString(),
      itemId,
      itemName: itemData.name,
      itemLocation: itemData.location,
      itemImage: itemData.image,
      itemCategory: itemData.category,
      dateFound: itemData.dateFound,
      type: "new",
      read: false,
      createdAt: new Date(),
    }));

    // Bulk insert for efficiency
    const result = await notificationsCollection.insertMany(notifications);
    
    console.log(
      `Created ${result.insertedCount} notifications for new item: ${itemId}`
    );
    
    return result.insertedCount;
  } catch (error) {
    // Log but don't throw - notifications shouldn't break item creation
    console.error("Error creating new item notifications:", error);
    return 0;
  }
}

/**
 * Creates a notification for the item owner when their item is claimed
 * @param {string} itemId - The ID of the claimed item
 * @param {Object} itemData - Item details for the notification
 * @param {string} ownerId - User ID of the item owner
 * @returns {Promise<boolean>} Success status
 */
export async function createClaimNotification(itemId, itemData, ownerId) {
  try {
    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");

    const notification = {
      userId: ownerId,
      itemId,
      itemName: itemData.name,
      itemLocation: itemData.location,
      itemImage: itemData.image,
      itemCategory: itemData.category,
      dateFound: itemData.dateFound,
      type: "claimed",
      read: false,
      createdAt: new Date(),
    };

    await notificationsCollection.insertOne(notification);
    
    console.log(
      `Created claim notification for item owner: ${ownerId}, item: ${itemId}`
    );
    
    return true;
  } catch (error) {
    console.error("Error creating claim notification:", error);
    return false;
  }
}
