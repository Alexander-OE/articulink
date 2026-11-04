// Fills the database with realistic sample data so the app looks alive.
//
// Run it manually with:  npm run seed
// It is never run by the server, and it refuses to run in production.
//
// Re-running is safe: it first deletes the data it created before (matched by
// the seed emails and article titles in seedData.ts) and creates it again.
// Anything else in the database is left alone.
//
// If your database still has users from before email/password sign-in, run
// "npm run migrate:users" once first. Otherwise the old unique username index
// makes creating users fail.
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User, {} from "../models/User.js";
import Article, {} from "../models/Article.js";
import Interaction from "../models/Interaction.js";
import { seedUsers, seedArticles, demoPassword } from "./seedData.js";
dotenv.config();
const HOUR_IN_MS = 60 * 60 * 1000;
const now = Date.now();
function refuseToRunInProduction() {
    if (process.env.NODE_ENV === "production") {
        console.error("Refusing to seed: NODE_ENV is 'production'.");
        process.exit(1);
    }
}
// Step 1: remove what an earlier run created, and nothing else.
async function removePreviousSeedData() {
    const oldUsers = await User.find({
        email: { $in: seedUsers.map((user) => user.email) },
    }).select("_id");
    const oldArticles = await Article.find({
        title: { $in: seedArticles.map((article) => article.title) },
    }).select("_id");
    const oldUserIds = oldUsers.map((user) => user._id);
    const oldArticleIds = oldArticles.map((article) => article._id);
    // Interactions go first because they point at users and articles.
    const deletedInteractions = await Interaction.deleteMany({
        $or: [
            { userId: { $in: oldUserIds } },
            { articleId: { $in: oldArticleIds } },
        ],
    });
    await User.deleteMany({ _id: { $in: oldUserIds } });
    await Article.deleteMany({ _id: { $in: oldArticleIds } });
    console.log(`Removed previous seed data: ${oldUsers.length} users, ` +
        `${oldArticles.length} articles, ${deletedInteractions.deletedCount} interactions.`);
}
// Step 2: create the users. They all share one demo password, so it is hashed
// once (with bcrypt, like the real register code) and the hash is reused.
async function createUsers() {
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const usersToCreate = seedUsers.map((user) => ({ ...user, passwordHash }));
    const users = await User.create(usersToCreate);
    console.log(`Created ${users.length} users.`);
    return users;
}
// Step 3: create the articles, each published some hours ago.
// The returned list is in the same order as seedArticles.
async function createArticles() {
    const articlesToCreate = seedArticles.map((article) => {
        const publishedAt = new Date(now - article.hoursAgo * HOUR_IN_MS);
        return {
            title: article.title,
            author: article.author,
            summary: article.summary,
            tags: article.tags,
            content: article.content,
            createdAt: publishedAt,
            updatedAt: publishedAt,
        };
    });
    const articles = await Article.create(articlesToCreate);
    console.log(`Created ${articles.length} articles.`);
    return articles;
}
function sharesAnyItem(first, second) {
    return first.some((item) => second.includes(item));
}
// Chooses who reads an article. Users whose interests match the article's
// tags come first, so recommendations look believable. The remaining users
// are rotated by the article's position so not everyone reads the same things.
function chooseReaders(users, article, articleIndex, readerCount) {
    const interestedUsers = users.filter((user) => sharesAnyItem(user.interests ?? [], article.tags));
    const otherUsers = users.filter((user) => !interestedUsers.includes(user));
    const rotateBy = otherUsers.length > 0 ? articleIndex % otherUsers.length : 0;
    const rotatedOthers = [
        ...otherUsers.slice(rotateBy),
        ...otherUsers.slice(0, rotateBy),
    ];
    return [...interestedUsers, ...rotatedOthers].slice(0, readerCount);
}
// Spreads interactions over roughly the last 16 days (so a 7-day trending
// window only sees some of them), never earlier than the article was published.
function chooseInteractionDate(article, articleIndex, interactionNumber) {
    const hoursAgoWanted = (interactionNumber * 11 + articleIndex * 5) % 400;
    const hoursSincePublished = (now - article.createdAt.getTime()) / HOUR_IN_MS;
    const hoursAgo = Math.min(hoursAgoWanted, hoursSincePublished - 1);
    return new Date(now - hoursAgo * HOUR_IN_MS);
}
// Step 4: create views, likes and shares. Popular articles get more readers,
// and not every reader likes or shares, like in real life.
async function createInteractions(users, articles) {
    const interactionsToCreate = [];
    articles.forEach((article, articleIndex) => {
        const popularity = seedArticles[articleIndex]?.popularity ?? 0;
        const readers = chooseReaders(users, article, articleIndex, popularity);
        const likeCount = Math.floor(readers.length * 0.6);
        const shareCount = Math.floor(readers.length * 0.25);
        let interactionNumber = 0;
        const addInteraction = (user, interactionType) => {
            const createdAt = chooseInteractionDate(article, articleIndex, interactionNumber++);
            interactionsToCreate.push({
                // Mongoose types a document's _id as unknown, so we state it here.
                userId: user._id,
                articleId: article._id,
                interactionType,
                createdAt,
                updatedAt: createdAt,
            });
        };
        readers.forEach((reader, readerIndex) => {
            addInteraction(reader, "view");
            if (readerIndex < likeCount)
                addInteraction(reader, "like");
            if (readerIndex < shareCount)
                addInteraction(reader, "share");
        });
    });
    const interactions = await Interaction.insertMany(interactionsToCreate);
    console.log(`Created ${interactions.length} interactions.`);
}
// Step 5: tell the person running the seed how to try the app.
function printDemoAccounts(users) {
    console.log("\nDemo accounts (sign in at /login):");
    for (const user of users.slice(0, 2)) {
        console.log(`  ${user.email}  /  ${demoPassword}`);
    }
}
async function runSeed() {
    refuseToRunInProduction();
    await connectDB();
    console.log(`Seeding database "${mongoose.connection.name}"...\n`);
    try {
        await removePreviousSeedData();
        const users = await createUsers();
        const articles = await createArticles();
        await createInteractions(users, articles);
        printDemoAccounts(users);
        console.log("\nSeeding finished.");
    }
    catch (error) {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
    }
}
runSeed();
//# sourceMappingURL=seed.js.map