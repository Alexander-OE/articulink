// One-time migration for databases created BEFORE email/password sign-in.
//
// Old users only have a `username`. The new User model needs a full name, an
// email and a password hash, and email must be unique. This script keeps the
// old users (so their interactions and trending counts survive) but:
//   - copies `username` into `fullName`
//   - gives each one a unique placeholder email that cannot receive mail
//   - gives each one a random password nobody knows, so these accounts cannot
//     be signed in to (their owners should register a new account)
//   - removes the old `username` field and its unique index
//
// Run it once with:  npm run migrate:users      (safe to run again: it does nothing new)
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
dotenv.config();
// The old model had a unique index on `username`. It must go first: once the
// field is removed, every user would have username = null and collide on it.
async function dropOldUsernameIndex() {
    const indexes = await User.collection.indexes();
    const hasOldIndex = indexes.some((index) => index.name === "username_1");
    if (hasOldIndex) {
        await User.collection.dropIndex("username_1");
        console.log("Dropped the old unique index on username.");
    }
}
async function convertLegacyUsers() {
    // Legacy users have a username and no email yet.
    const legacyUsers = await User.collection
        .find({ username: { $exists: true }, email: { $exists: false } })
        .toArray();
    for (const legacyUser of legacyUsers) {
        const unusablePasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
        await User.collection.updateOne({ _id: legacyUser._id }, {
            $set: {
                fullName: legacyUser.username,
                // The id keeps the placeholder unique even if two usernames only differ by case.
                email: `legacy-${legacyUser._id}@articulink.invalid`,
                passwordHash: unusablePasswordHash,
            },
            $unset: { username: "" },
        });
    }
    console.log(`Converted ${legacyUsers.length} legacy users.`);
}
async function runMigration() {
    await connectDB();
    console.log(`Migrating users in database "${mongoose.connection.name}"...\n`);
    try {
        await dropOldUsernameIndex();
        await convertLegacyUsers();
        // Creates the unique email index and removes any other index the model no longer defines.
        await User.syncIndexes();
        console.log("Indexes are in sync with the User model.\nMigration finished.");
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
    }
}
runMigration();
//# sourceMappingURL=migrateLegacyUsers.js.map