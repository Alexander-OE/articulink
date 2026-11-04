import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
const dirname = path.dirname(fileURLToPath(import.meta.url));
// Point the scanner at the route files that hold the @openapi annotations.
// Forward slashes keep the glob valid on Windows as well.
const routesGlob = path.join(dirname, "../routes/*.ts").replace(/\\/g, "/");
const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Articulink API",
            version: "1.0.0",
            description: "Smart Content Aggregator backend — articles with AI summaries and tags, " +
                "full-text search, trending, personalized recommendations, and engagement stats.",
        },
        servers: [
            { url: "http://localhost:3000", description: "Local development" },
        ],
        tags: [
            { name: "Auth", description: "Register, sign in, and get the current user" },
            { name: "Articles", description: "Create, read, search, and rank articles" },
            { name: "Users", description: "Your own profile, activity, and recommendations" },
            { name: "Interactions", description: "Record views, likes, and shares" },
            { name: "System", description: "Service health" },
        ],
        components: {
            // Makes the "Authorize" button appear in /docs. Paste the token from
            // /auth/login or /auth/register (without the word "Bearer").
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
            schemas: {
                Article: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "6abf9efe93a9d71c5e5de0b5" },
                        title: { type: "string", example: "The Rise of AI in Modern Software" },
                        content: { type: "string" },
                        author: { type: "string", example: "Jane Doe", description: "The full name of the user who created it" },
                        summary: { type: "string", description: "AI-generated if omitted on create" },
                        tags: {
                            type: "array",
                            items: { type: "string" },
                            example: ["software", "artificial", "intelligence"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ArticleInput: {
                    type: "object",
                    required: ["title", "content"],
                    properties: {
                        title: { type: "string", maxLength: 500, example: "The Rise of AI in Modern Software" },
                        content: { type: "string", example: "Artificial intelligence is transforming software..." },
                        summary: {
                            type: "string",
                            description: "Optional. Auto-generated with Gemini AI when omitted.",
                        },
                        tags: {
                            type: "array",
                            items: { type: "string" },
                            description: "Optional. Auto-generated with Gemini AI when omitted.",
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "6abf9f1993a9d71c5e5de0b7" },
                        fullName: { type: "string", example: "Ada Lovelace" },
                        email: { type: "string", format: "email", example: "ada@example.com" },
                        interests: {
                            type: "array",
                            items: { type: "string" },
                            example: ["technology", "ai"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    description: "The password hash is never included in any response.",
                },
                RegisterInput: {
                    type: "object",
                    required: ["fullName", "email", "password"],
                    properties: {
                        fullName: { type: "string", minLength: 2, maxLength: 100, example: "Ada Lovelace" },
                        email: { type: "string", format: "email", example: "ada@example.com" },
                        password: { type: "string", minLength: 6, maxLength: 72, format: "password", example: "correct-horse-battery" },
                        interests: {
                            type: "array",
                            items: { type: "string" },
                            description: "Optional.",
                            example: ["technology", "ai"],
                        },
                    },
                },
                LoginInput: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "ada@example.com" },
                        password: { type: "string", format: "password", example: "correct-horse-battery" },
                    },
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        token: { type: "string", description: "JWT. Send it as a Bearer token." },
                        user: { $ref: "#/components/schemas/User" },
                    },
                },
                Interaction: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        userId: { type: "string" },
                        articleId: { type: "string" },
                        interactionType: {
                            type: "string",
                            enum: ["view", "like", "share"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                InteractionInput: {
                    type: "object",
                    required: ["article_id", "interaction_type"],
                    properties: {
                        article_id: { type: "string", example: "6abf9efe93a9d71c5e5de0b5" },
                        interaction_type: {
                            type: "string",
                            enum: ["view", "like", "share"],
                            example: "like",
                        },
                    },
                },
                ArticleStats: {
                    type: "object",
                    properties: {
                        articleId: { type: "string" },
                        stats: {
                            type: "object",
                            properties: {
                                views: { type: "integer", example: 12 },
                                likes: { type: "integer", example: 4 },
                                shares: { type: "integer", example: 1 },
                                total: { type: "integer", example: 17 },
                            },
                        },
                    },
                },
                PaginatedArticles: {
                    type: "object",
                    properties: {
                        data: { type: "array", items: { $ref: "#/components/schemas/Article" } },
                        meta: {
                            type: "object",
                            properties: {
                                total: { type: "integer", example: 42 },
                                limit: { type: "integer", example: 10 },
                                offset: { type: "integer", example: 0 },
                            },
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            oneOf: [
                                { type: "string" },
                                { type: "array", items: { type: "string" } },
                            ],
                            description: "Validation errors are an array of messages. Other errors are a code such as not_found, invalid_credentials, email_already_registered, missing_token, invalid_token or forbidden.",
                            example: "not_found",
                        },
                    },
                },
            },
        },
    },
    apis: [routesGlob],
};
export const swaggerSpec = swaggerJSDoc(options);
//# sourceMappingURL=swagger.js.map