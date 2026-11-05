# Articulink: Smart Content Aggregator (Backend)

Articulink is a REST API (a web service that other programs talk to over HTTP) for publishing and discovering articles. It writes a summary and topic tags for each new article using Google Gemini AI. It then uses what readers do (views, likes, shares) to rank **trending** articles and to give each reader **personalized recommendations**.

A separate frontend app (built in its own project, not in this repo) consumes this API.

---

## Table of Contents

1. [What problem does it solve?](#1-what-problem-does-it-solve)
2. [Key features](#2-key-features)
3. [Tech stack](#3-tech-stack)
4. [How it works](#4-how-it-works)
5. [Project structure](#5-project-structure)
6. [Getting started](#6-getting-started)
7. [Environment variables](#7-environment-variables)
8. [Authentication](#8-authentication)
9. [Data models](#9-data-models)
10. [API reference](#10-api-reference)
11. [Error handling](#11-error-handling)
12. [Deployment](#12-deployment)
13. [Known limitations and ideas for improvement](#13-known-limitations-and-ideas-for-improvement)

---

## 1. What problem does it solve?

When a content library grows, it gets hard to browse. Articles often have no summary or tags, and readers get no hint about what is worth reading.

Articulink fixes both:

- It **fills in the missing summary and tags automatically**.
- It **learns from reader behaviour** to show what is popular and what suits each person.

With the API, a user can:

- create an account and sign in;
- publish articles;
- browse, filter by tag, and search articles;
- see trending articles and the stats for one article;
- record a view, like or share;
- get a personal list of recommended articles and a history of their recent activity.

---

## 2. Key features

- **Accounts and sign-in.** Register with full name, email and password. Sign in to get a JWT (a signed token that proves who you are).
- **Articles.** Create, fetch by id, and list with pagination (and an optional tag filter).
- **AI summary and tags.** If you leave out `summary` or `tags` when creating an article, Gemini writes them. If there is no API key or the AI call fails, simple built-in fallbacks are used, so creating an article never fails because of the AI.
- **Full-text search** over title, content and tags, ranked by relevance.
- **Trending.** Articles ranked by weighted engagement over the last N days (share = 5 points, like = 3, view = 1).
- **Interactions.** A signed-in user records a `view`, `like` or `share` on an article.
- **Stats.** View, like and share counts for each article.
- **Recommendations.** Built from the user's interests plus the tags of articles they have already engaged with. Articles they have already seen are left out.
- **Activity.** A user's 50 most recent interactions.
- **Extras.** Request validation (Joi), one central error handler, a `/health` check, Swagger docs at `/docs`, security headers (`helmet`), request logging (`morgan`), and a seed script that fills the database with demo data.

---

## 3. Tech stack

| Technology | Why it is used |
| --- | --- |
| **TypeScript** (5.9) on **Node.js**, as ES modules | Typed JavaScript catches mistakes early. |
| **Express 5** | Web framework: handles HTTP requests and routing. |
| **MongoDB** with **Mongoose 8** | Database plus a schema layer. Gives us a text index (search) and aggregation (trending, stats). |
| **Joi** | Checks that request bodies and query strings are valid. |
| **jsonwebtoken** | Creates and verifies JWT sign-in tokens. |
| **bcryptjs** | Hashes passwords so the real password is never stored. |
| **@google/generative-ai** (model `gemini-1.5-flash`) | Generates article summaries and tags. |
| **swagger-jsdoc** + **swagger-ui-express** | Builds the OpenAPI spec from code comments and serves the interactive docs. |
| **helmet** | Adds standard security headers. |
| **morgan** | Logs each request (`dev` format). |
| **dotenv** | Loads settings from a `.env` file. |
| **nodemon** + **ts-node** | Dev only: run TypeScript directly and reload on changes. |

`axios` is listed in `package.json` but is not used anywhere in `src/`.

---

## 4. How it works

The code is split into layers. A request passes through them in this order:

```
Request -> route -> (requireAuth, if protected) -> controller -> Joi validation -> Mongoose model -> MongoDB
                                                       |
                                          errors go to the central error handler -> JSON error response
```

- **Routes** ([src/routes/](src/routes)) map a URL and method to a controller. They also hold the Swagger comments.
- **Middleware** ([src/middleware/](src/middleware)) checks the token (`requireAuth`) and handles errors.
- **Controllers** ([src/controllers/](src/controllers)) hold the logic for each endpoint.
- **Models** ([src/models/](src/models)) describe what is stored in MongoDB.

### Main flows

**Register and sign in**
1. `POST /auth/register` validates the input and hashes the password with bcrypt.
2. It saves the user, then returns `{ token, user }`.
3. Later, `POST /auth/login` checks the email and password and returns a new `{ token, user }`.

**Calling a protected endpoint**
1. The client sends `Authorization: Bearer <token>`.
2. `requireAuth` verifies the token, loads the user from the database, and attaches it to the request.
3. The controller uses that user. The client never says who it is in the body.

**Create an article** (`POST /articles`)
1. Check the token and validate the body.
2. If `summary` is missing or blank, generate one. If `tags` is missing or empty, generate them. Both run at the same time.
3. Save the article. Its `author` is set to the signed-in user's full name.

**Interact with an article** (`POST /interactions`)
1. Check the token and validate the body.
2. Check that the article exists.
3. Save an interaction for the signed-in user.

**Trending, stats and recommendations** are calculated on request from the saved interactions. Nothing is cached.

**Recommendations in detail.**
1. Collect the articles the user has interacted with. These are "seen".
2. Build a tag set from the user's `interests` plus the tags of the seen articles.
3. Return up to 10 unseen articles that share a tag with that set, newest first (`strategy: "personalized"`).
4. If there are none (for example a brand-new user with no interests), return the 10 newest unseen articles (`strategy: "fallback_recent"`).

**AI helpers.**
- *Summary* ([generateSummary.ts](src/utils/generateSummary.ts)): asks Gemini for a 2 to 3 sentence summary. Fallback: the first 50 words of the content followed by `...`.
- *Tags* ([generateTags.ts](src/utils/generateTags.ts)): asks Gemini for 3 to 6 tags, then lowercases them and removes odd characters and duplicates. Fallback: the most frequent words (longer than 3 letters, not common stopwords) from the title and content, up to 6.

---

## 5. Project structure

```
backend/
├── src/
│   ├── app.ts                       # Starts everything: middleware, routes, Swagger, DB connect, listen
│   ├── config/
│   │   ├── db.ts                    # connectDB(): connects to MongoDB, exits the process on failure
│   │   └── swagger.ts               # OpenAPI definition; reads @openapi comments from routes/*.ts
│   ├── controllers/
│   │   ├── auth.controller.ts       # register, login, current user
│   │   ├── articles.controller.ts   # create, list, search, trending, get by id, stats
│   │   ├── users.controller.ts      # own profile, activity, recommendations
│   │   └── interactions.controller.ts  # record an interaction
│   ├── middleware/
│   │   ├── auth.ts                  # requireAuth (checks the Bearer token), getAuthenticatedUser
│   │   └── errorHandler.ts          # AppError class, 404 handler, central error handler
│   ├── models/
│   │   ├── User.ts                  # User schema
│   │   ├── Article.ts               # Article schema (+ text index)
│   │   └── Interaction.ts           # Interaction schema
│   ├── routes/
│   │   ├── auth.route.ts            # /auth/*
│   │   ├── articles.route.ts        # /articles/*
│   │   ├── users.route.ts           # /users/*
│   │   └── interactions.route.ts    # /interactions
│   ├── validators/
│   │   ├── auth.validator.ts        # Joi: register, login
│   │   ├── articles.validator.ts    # Joi: create, list, search, trending
│   │   ├── interactions.validator.ts # Joi: create interaction
│   │   └── users.validator.ts       # Joi: list query (defined but not used)
│   ├── utils/
│   │   ├── token.ts                 # Create and read JWTs; checks JWT_SECRET at startup
│   │   ├── asyncHandler.ts          # Passes errors from async controllers to the error handler
│   │   ├── generateSummary.ts       # Gemini summary with fallback
│   │   ├── generateTags.ts          # Gemini tags with fallback
│   │   └── paginator.ts             # Builds the { data, meta } list response
│   ├── seed/
│   │   ├── seed.ts                  # Demo data script (npm run seed)
│   │   └── seedData.ts              # The sample users and articles
│   └── migrations/
│       └── migrateLegacyUsers.ts    # One-time script for databases from before email/password sign-in
├── dist/                            # Compiled JavaScript from `npm run build` (committed to Git)
├── .env.example                     # Template for your .env file
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript settings (src/ -> dist/)
└── README.md
```

---

## 6. Getting started

### Prerequisites

- **Node.js** and **npm**. The project does not pin a Node version (there is no `engines` field). Use a current LTS release.
- A **MongoDB** database: local, or a free MongoDB Atlas cluster.
- Optional: a **Google Gemini API key** for AI summaries and tags.

### Install

```bash
git clone https://github.com/Alexander-OE/articulink.git
cd articulink/backend
npm install
cp .env.example .env     # then open .env and fill in the values (see section 7)
```

> The repo's `backend` folder is the project root. Run all commands from inside it.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server. Runs the TypeScript directly with `ts-node` and reloads when files in `src/` change. |
| `npm run build` | Compiles `src/` to JavaScript in `dist/` (`tsc`). |
| `npm start` | Production server. Runs the compiled `dist/app.js`. Run `npm run build` first. |
| `npm run seed` | Fills the database with demo users, articles and interactions (see [Seed script](#seed-script)). |
| `npm run migrate:users` | One-time migration for old databases (see [Migration script](#migration-script)). |
| `npm test` | Placeholder only. There are no tests, and it exits with an error. |

### Run it

**Development**
```bash
npm run dev
```

**Production**
```bash
npm run build
npm start
```

When it starts you should see `MongoDB connected` and `Server running on port ...`. The server uses `PORT` from `.env`, or **4000** if `PORT` is empty.

Quick check:
```bash
curl http://localhost:4000/health
```

Interactive docs: <http://localhost:4000/docs>

---

## 7. Environment variables

Copy `.env.example` to `.env` and fill it in. Never commit `.env` (it is in `.gitignore`).

| Variable | Required | What it does | Example placeholder |
| --- | --- | --- | --- |
| `PORT` | No | Port the server listens on. Defaults to `4000` if empty. Hosting platforms usually set it for you. | `4000` |
| `MONGO_URI` | **Yes** | MongoDB connection string. If it is missing or wrong, the server logs an error and exits. | `mongodb://localhost:27017/articulink` |
| `JWT_SECRET` | **Yes** | Secret key used to sign login tokens. The server refuses to start without it. Use a long random string. | `replace-with-a-long-random-string` |
| `JWT_EXPIRES_IN` | No | How long a token stays valid (for example `7d` or `12h`). Defaults to `7d`. | `7d` |
| `GEMINI_API_KEY` | No | Turns on AI summaries and tags. Without it, the built-in fallbacks are used. | `your-gemini-api-key` |

To make a good `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

One more variable is read by the code but is not in `.env.example`: `NODE_ENV`. The seed script refuses to run when `NODE_ENV` is `production`.

---

## 8. Authentication

Articulink uses **email + password** sign-in and **JWT bearer tokens**.

**Registering.** `POST /auth/register` takes `fullName`, `email`, `password` (and optional `interests`). The password is hashed with bcrypt (10 rounds) and only the hash is saved. The email is saved in lowercase and must be unique. The response contains a token and the user.

**Logging in.** `POST /auth/login` checks the email and password and returns a token and the user. A wrong email and a wrong password give the **same** error (`invalid_credentials`), so an attacker cannot tell which emails have accounts.

**The token.**
- It is a JWT signed with `JWT_SECRET`. It carries only the user's id.
- It expires after `JWT_EXPIRES_IN` (default 7 days).
- The client sends it on protected requests:
  ```
  Authorization: Bearer <token>
  ```
- On every protected request the server verifies the token and loads the user from the database. If the user no longer exists, the token is rejected.
- Forged, malformed and expired tokens all return the same `invalid_token` error.

**Which endpoints need a token?**

| Access | Endpoints |
| --- | --- |
| **Public** | `GET /`, `GET /health`, `GET /docs`, `GET /docs.json`, `POST /auth/register`, `POST /auth/login`, `GET /articles`, `GET /articles/search`, `GET /articles/trending`, `GET /articles/:id`, `GET /articles/:id/stats` |
| **Token required** | `GET /auth/me`, `POST /articles`, `POST /interactions` |
| **Token required, own data only** | `GET /users/:id`, `GET /users/:id/activity`, `GET /users/:id/recommendations`. The `:id` must be the signed-in user's own id, otherwise `403 forbidden`. |

The passwordHash is never returned in any response.

---

## 9. Data models

All models use Mongoose `timestamps`, so every document also has `createdAt` and `updatedAt` (set automatically), plus `_id` and `__v` (added by MongoDB/Mongoose).

### User (collection `users`)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `fullName` | String | Yes | Trimmed. 2 to 100 characters. |
| `email` | String | Yes | Trimmed, saved in lowercase, **unique**. |
| `passwordHash` | String | Yes | bcrypt hash. Hidden from queries by default and removed from all JSON responses. |
| `interests` | [String] | No (default `[]`) | Topics the user likes. Used for recommendations. |

### Article (collection `articles`)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | String | Yes | Trimmed. The API limits it to 500 characters. |
| `content` | String | Yes | The article body. |
| `author` | String | Yes | A **copy** of the creator's full name at creation time. It is plain text, not a link to the User. |
| `summary` | String | No (default `""`) | Generated by the API if left out. |
| `tags` | [String] | No (default `[]`) | Generated by the API if left out or empty. |

Indexes: one on `tags`, and a **text index** on `title`, `content` and `tags` (used by search).

### Interaction (collection `interactions`)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userId` | ObjectId (ref `User`) | Yes | Who did it. Always the signed-in user. |
| `articleId` | ObjectId (ref `Article`) | Yes | Which article. |
| `interactionType` | String: `view`, `like` or `share` | Yes | The kind of engagement. |

There is no uniqueness rule: the same user can create the same interaction many times.

### How they relate

```
User 1 ──── * Interaction * ──── 1 Article
```

- `Interaction` links a user to an article. One user has many interactions, and one article has many interactions.
- `Article.author` is just a name string, not a reference.
- A user's `interests` and an article's `tags` are both free text. Recommendations compare them by **exact** text match.

---

## 10. API reference

- **Base URL (local):** `http://localhost:4000` (or your `PORT`). On Render, use your service URL.
- There is no version prefix. Requests and responses are JSON (`Content-Type: application/json`).
- In the examples, `$TOKEN` means the token returned by register or login.

### Endpoint summary

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | Service banner |
| GET | `/health` | Public | Health check |
| GET | `/docs` | Public | Swagger UI |
| GET | `/docs.json` | Public | Raw OpenAPI spec |
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Sign in |
| GET | `/auth/me` | Token | Current user |
| POST | `/articles` | Token | Create an article |
| GET | `/articles` | Public | List articles |
| GET | `/articles/search` | Public | Full-text search |
| GET | `/articles/trending` | Public | Trending articles |
| GET | `/articles/:id` | Public | Get one article |
| GET | `/articles/:id/stats` | Public | Engagement counts |
| GET | `/users/:id` | Token (own) | Get your user |
| GET | `/users/:id/activity` | Token (own) | Your recent interactions |
| GET | `/users/:id/recommendations` | Token (own) | Your recommendations |
| POST | `/interactions` | Token | Record a view, like or share |

Validation rules in the tables below are enforced by Joi. On `POST` bodies, **unknown fields are rejected** with a 400. On query strings, unknown parameters are ignored.

### System

#### `GET /`
```json
{ "name": "Articulink", "status": "ok" }
```

#### `GET /health`
```json
{ "status": "ok", "uptime": 123.45, "timestamp": 1760000000000 }
```
`uptime` is in seconds. `timestamp` is epoch milliseconds. It does **not** check the database.

#### `GET /docs` and `GET /docs.json`
The Swagger UI page and the raw OpenAPI 3.0.3 JSON. In the UI, click **Authorize** and paste the token (without the word "Bearer") to try protected endpoints.

### Auth

#### `POST /auth/register`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `fullName` | string | Yes | 2 to 100 characters (trimmed) |
| `email` | string | Yes | Valid email, max 254 characters. Stored in lowercase. |
| `password` | string | Yes | 6 to 72 characters |
| `interests` | string[] | No | List of non-empty strings |

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"correct-horse-battery","interests":["technology","ai"]}'
```
Response `201`:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "6abf9f1993a9d71c5e5de0b7",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "interests": ["technology", "ai"],
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z",
    "__v": 0
  }
}
```
Errors: `400` validation (array of messages), `409 email_already_registered`.

#### `POST /auth/login`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Trimmed and lowercased before the lookup |
| `password` | string | Yes | |

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"correct-horse-battery"}'
```
Response `200`: same shape as register (`{ token, user }`).
Errors: `400` (a field is missing), `401 invalid_credentials`.

#### `GET /auth/me`  (token)
Returns the signed-in user (same object as `user` above).
```bash
curl http://localhost:4000/auth/me -H "Authorization: Bearer $TOKEN"
```
Errors: `401 missing_token` or `401 invalid_token`.

### Articles

#### `POST /articles`  (token)

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Not empty, max 500 characters |
| `content` | string | Yes | Not empty |
| `summary` | string / null | No | If missing, null or blank, it is generated |
| `tags` | string[] | No | If missing or empty, they are generated |

Do **not** send `author`. It is set from your account, and sending it gives a 400.

```bash
curl -X POST http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"The Rise of AI in Modern Software","content":"Artificial intelligence is transforming software..."}'
```
Response `201` (the saved article):
```json
{
  "_id": "6abf9efe93a9d71c5e5de0b5",
  "title": "The Rise of AI in Modern Software",
  "content": "Artificial intelligence is transforming software...",
  "author": "Ada Lovelace",
  "summary": "AI is reshaping how software is built...",
  "tags": ["software", "artificial intelligence"],
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z",
  "__v": 0
}
```
Errors: `400` validation (array), `401`.

#### `GET /articles`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `limit` | integer | 10 | 1 to 100 |
| `offset` | integer | 0 | 0 or more |
| `tag` | string | none | Exact, case-sensitive match against an article's tags |

Newest first. Example: `GET /articles?limit=5&offset=0&tag=ai`

Response `200`:
```json
{
  "data": [ { "_id": "...", "title": "...", "tags": ["ai"], "author": "...", "...": "..." } ],
  "meta": { "total": 42, "limit": 5, "offset": 0 }
}
```
Errors: `400`.

#### `GET /articles/search`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `q` | string | required | 1 to 200 characters |
| `limit` | integer | 10 | 1 to 100 |
| `offset` | integer | 0 | 0 or more |

Example: `GET /articles/search?q=artificial%20intelligence`

Uses MongoDB text search, ordered by relevance. Same `{ data, meta }` response as the list. Each result is also expected to carry a `score` (the relevance value). Errors: `400`.

#### `GET /articles/trending`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `days` | integer | 7 | 1 to 365 |
| `limit` | integer | 10 | 1 to 50 |

Only counts interactions from the last `days` days. Score = shares × 5 + likes × 3 + views × 1. Only articles with at least one interaction in that window appear. Not paginated.

Response `200`:
```json
{
  "data": [
    { "article": { "_id": "...", "title": "..." }, "score": 24, "views": 10, "likes": 4, "shares": 0 }
  ],
  "meta": { "days": 7, "limit": 10 }
}
```
Errors: `400`.

#### `GET /articles/:id`
Returns the article (same shape as the create response). Errors: `400 invalid_id`, `404 not_found`.

#### `GET /articles/:id/stats`
All-time counts for the article.
```json
{ "articleId": "6abf9efe93a9d71c5e5de0b5", "stats": { "views": 12, "likes": 4, "shares": 1, "total": 17 } }
```
Errors: `400 invalid_id`, `404 not_found`.

### Users

All three routes need a token, and `:id` must be **your own** user id (you can get it from `user._id`). Check order: token first (`401`), then a valid id (`400 invalid_id`), then ownership (`403 forbidden`).

#### `GET /users/:id`
Returns your user object.
```bash
curl http://localhost:4000/users/6abf9f1993a9d71c5e5de0b7 -H "Authorization: Bearer $TOKEN"
```

#### `GET /users/:id/activity`
Your 50 most recent interactions, newest first, with the article's `title`, `author` and `tags` filled in. Not paginated.
```json
{
  "userId": "6abf9f1993a9d71c5e5de0b7",
  "interactions": [
    {
      "_id": "...",
      "userId": "6abf9f1993a9d71c5e5de0b7",
      "articleId": { "_id": "...", "title": "...", "author": "...", "tags": ["ai"] },
      "interactionType": "like",
      "createdAt": "...", "updatedAt": "...", "__v": 0
    }
  ]
}
```

#### `GET /users/:id/recommendations`
No query parameters. Returns up to 10 articles (see [How it works](#4-how-it-works)).
```json
{
  "userId": "6abf9f1993a9d71c5e5de0b7",
  "strategy": "personalized",
  "matchedInterests": ["technology", "ai", "software"],
  "data": [ { "_id": "...", "title": "...", "tags": ["ai", "software"] } ]
}
```
`strategy` is `"personalized"` or `"fallback_recent"`. `matchedInterests` is the tag set that was used.

### Interactions

#### `POST /interactions`  (token)

Note the **snake_case** field names in this body. The user comes from the token, so there is no `user_id`.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `article_id` | string | Yes | A valid ObjectId of an existing article |
| `interaction_type` | string | Yes | `view`, `like` or `share` |

```bash
curl -X POST http://localhost:4000/interactions \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"article_id":"6abf9efe93a9d71c5e5de0b5","interaction_type":"like"}'
```
Response `201` (stored fields are camelCase):
```json
{
  "_id": "...",
  "userId": "6abf9f1993a9d71c5e5de0b7",
  "articleId": "6abf9efe93a9d71c5e5de0b5",
  "interactionType": "like",
  "createdAt": "...", "updatedAt": "...", "__v": 0
}
```
Errors: `400` validation (array), `400 invalid_id`, `401`, `404 article_not_found`.

### Seed script

Not an HTTP endpoint. It is a command-line script that fills the database with demo content.

```bash
npm run seed
```

- Creates **9 users**, **32 articles** and a spread of views, likes and shares over roughly the last 16 days. This gives the trending and recommendation endpoints something to show.
- All seeded users share one demo password. It is the `demoPassword` value in [src/seed/seedData.ts](src/seed/seedData.ts), and the script prints two demo accounts when it finishes. Seeded emails look like `amara.okafor@example.com`.
- Safe to run again: it first deletes only the data it created earlier (matched by the seed emails and article titles), then recreates it. Other data is left alone.
- It **refuses to run if `NODE_ENV=production`**.
- It writes to whatever database `MONGO_URI` points to, so check that value first.
- If your database has users from before email/password sign-in, run the migration first.

### Migration script

```bash
npm run migrate:users
```

A one-time script for old databases whose users only had a `username`. It copies `username` into `fullName`, gives each user a placeholder `...@articulink.invalid` email and an unknown random password (so those accounts cannot be signed in to), removes `username` and its old index, and syncs the User indexes. Safe to run twice. A fresh database does not need it.

---

## 11. Error handling

Every error response is JSON with an `error` key. Code: [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts).

```json
{ "error": "not_found" }
```

Validation errors are different: `error` is an **array** of messages, and all problems are listed at once.

```json
{ "error": ["\"title\" is required", "\"content\" is required"] }
```

| Status | `error` value | When |
| --- | --- | --- |
| 400 | array of messages | A Joi validation rule failed |
| 400 | `invalid_id` | An id is not a valid MongoDB ObjectId |
| 400 | message from Express | The request body is not valid JSON |
| 401 | `missing_token` | No `Authorization: Bearer ...` header |
| 401 | `invalid_token` | Token is forged, malformed, expired, or its user no longer exists |
| 401 | `invalid_credentials` | Wrong email or password |
| 403 | `forbidden` | Using `/users/:id` with an id that is not yours |
| 404 | `not_found` | Article not found |
| 404 | `article_not_found` | `POST /interactions` with an unknown article |
| 404 | `route_not_found` | No such route (the body also has a `path` field) |
| 409 | `email_already_registered` | Registering an email that is already used |
| 500 | `internal_server_error` | Anything unexpected (details are logged on the server only) |

Controllers throw `AppError(message, status)`. `asyncHandler` passes any failed async code to the central handler. For status codes below 500 the handler returns the error's own message. For 500 and above it returns the generic message.

Clients should handle both shapes: an array for validation errors, a string for everything else.

---

## 12. Deployment

The backend is deployed on **Render** (a hosting platform) with **MongoDB Atlas** (a hosted MongoDB database).

> This repo has no Render config file (such as `render.yaml`), so the settings below are the standard ones for this project's scripts. Check them against your Render dashboard.

**1. Database (Atlas)**
1. Create a cluster and a database user.
2. Under *Network Access*, allow connections from Render (many people allow `0.0.0.0/0` on small projects).
3. Copy the connection string. It becomes `MONGO_URI`.

**2. Web service (Render)**
1. Create a **Web Service** from the GitHub repo. If the repo root is not this folder, set the root directory to `backend`.
2. Settings:

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

3. Add these environment variables in the Render dashboard: `MONGO_URI`, `JWT_SECRET`, and (optional) `JWT_EXPIRES_IN`, `GEMINI_API_KEY`. Render supplies `PORT` itself. See [section 7](#7-environment-variables).
4. Use the `/health` endpoint as the health check path.

**Good to know**
- On the **free tier**, the service goes to sleep after a period of inactivity (about 15 minutes). The next request can take up to a minute while it wakes up. The first request from the frontend may therefore look slow.
- The seed script refuses to run when `NODE_ENV=production`.
- See the Swagger and CORS notes in the next section before relying on the deployed docs or a browser frontend.

---

## 13. Known limitations and ideas for improvement

These were noticed while reading the code. None of them were changed.

**Security and access**
1. **No CORS.** No CORS headers are set anywhere in the code. A browser app on a different origin will be blocked unless it goes through a proxy. It is unclear how the current frontend gets around this.
2. **No password reset, change password, email verification, logout or token refresh.** A token stays valid until it expires.
3. **No rate limiting**, so login can be tried repeatedly.
4. **Anyone signed in can publish.** There are no roles, and articles cannot be edited or deleted.

**Missing features**
5. No endpoint to update a user's name or **interests**. Interests are only set at registration, yet recommendations depend on them.
6. No update/delete for articles, no way to remove an interaction (for example "unlike"), and no endpoint to list a user's own articles.
7. `GET /users/:id` is almost the same as `GET /auth/me`, because the id must be your own.

**Data and logic**
8. **Interactions are not de-duplicated.** Repeated likes and views all count, and they inflate stats and trending.
9. There are no indexes on `Interaction.userId` or `Interaction.articleId`, which may slow stats, trending and recommendations as data grows.
10. `author` is a copy of the name at creation time. It will not follow later name changes (though no endpoint changes names today).
11. Tag and interest matching is exact and case-sensitive. Tags you send yourself are not lowercased.
12. Activity (50) and recommendations (10) have fixed sizes. Activity and trending are not paginated.

**AI**
13. The model name `gemini-1.5-flash` is hard-coded and has no timeout. Google may have retired this model. If so, every call silently falls back to the simple summary and tags (only a log message shows it). Consider making the model a setting.

**API docs (Swagger)**
14. The Swagger server URL is hard-coded to `http://localhost:3000`, but the code default port is **4000**. "Try it out" will not reach the right server locally or on Render without editing it.
15. `swagger.ts` reads `routes/*.ts`. In the compiled `dist/` build, the route files are `.js`, so the `@openapi` comments probably will not be found and `/docs` may show no endpoints in production. This comes from reading the code and was not tested on a running build.
16. The `System` tag exists in Swagger, but `/` and `/health` have no Swagger annotations. Some responses (for example `400 invalid_id` on stats, and the `score` field on search) are not documented.

**Project health**
17. **No tests.** `npm test` is a placeholder.
18. The dev, seed and migrate scripts use `--experimental-specifier-resolution=node`, an old Node flag that newer Node versions removed. They may fail on some Node versions. This was not verified by running them.
19. `dist/` is committed to Git and not in `.gitignore`, so it can go out of date. Rebuild with `npm run build` before relying on it.
20. Unused code and packages: `axios`, `listQuerySchema` in `users.validator.ts`, and the `@types/axios`, `@types/helmet` and `@types/joi` packages (these libraries ship their own types, so those stub packages are likely unnecessary).
21. `/health` does not check the database. `MONGO_URI` falls back to an empty string when unset, which gives a generic connection error rather than a clear "missing variable" message.
22. Error shapes are inconsistent (array vs string), and validation errors have no machine-readable code.
23. Small tidy-ups: `generateSummary.ts` starts with a stale comment (`src/services/summary.service.ts`), and several files (models, validators, some routes) are formatted differently from the rest.
