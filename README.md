# Articulink
### Smart Content Aggregator (Backend)

Articulink is a REST backend for publishing and discovering articles. Articles get an AI-generated summary and topical tags (via Google Gemini, with offline fallbacks). Users record engagement (views, likes, shares), and the API turns that into **search**, **trending** rankings, per-article **stats** and **personalized recommendations**.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [Data Models](#5-data-models)
6. [API Reference](#6-api-reference)
7. [Authentication and Authorization](#7-authentication-and-authorization)
8. [Error Handling](#8-error-handling)
9. [Utilities and Special Logic](#9-utilities-and-special-logic)
10. [API Documentation (Swagger)](#10-api-documentation-swagger)
11. [Notes for Frontend Development](#11-notes-for-frontend-development)
12. [Known Gaps and Suggestions](#12-known-gaps-and-suggestions)

---

## 1. Overview

**Problem it solves.** Content libraries get hard to navigate as they grow: articles arrive without summaries or tags, and readers have no signal for what's worth reading. Articulink fills in the metadata automatically and uses reader behaviour to surface relevant and popular content.

**Who it's for.** Anyone building a reader-facing content product (a news/blog aggregator, a knowledge base, a curated reading app). This repo is the backend; a frontend UI is planned next.

**Core features**

- **Articles**: create, fetch by id, paginated list (optionally filtered by tag).
- **AI summary and tags**: if the client omits `summary` and/or `tags` on create, they are generated with Gemini. If there's no API key or the call fails, simple fallbacks are used, so creating an article never fails because of AI.
- **Full-text search** over title, content and tags, ranked by relevance.
- **Trending**: articles ranked by weighted engagement (share = 5, like = 3, view = 1) over a configurable number of days.
- **Engagement stats** per article (views / likes / shares / total).
- **Users**: register with a unique username and optional interests; fetch a user; view their 50 most recent interactions.
- **Interactions**: record a `view`, `like` or `share` of an article by a user.
- **Recommendations**: built from the user's interests plus the tags of articles they've engaged with, excluding already-seen articles; falls back to newest unseen articles.
- **Operational**: Joi request validation, centralized error handler, `/health` probe, Swagger docs, `helmet` security headers, `morgan` request logging.

---

## 2. Tech Stack

| Area | Technology | Used for |
| --- | --- | --- |
| Language / runtime | TypeScript 5.9, Node.js (ES modules, `"type": "module"`) | Application code |
| Web framework | Express 5 | HTTP server and routing |
| Database | MongoDB via Mongoose 8 | Persistence, text index, aggregation pipelines |
| Validation | Joi 18 | Request body and query validation |
| AI | `@google/generative-ai` (model `gemini-1.5-flash`) | Summary and tag generation |
| Security / logging | `helmet`, `morgan` (`dev` format) | Security headers, request logging |
| Config | `dotenv` | Loads `.env` |
| API docs | `swagger-jsdoc`, `swagger-ui-express` | OpenAPI 3.0.3 spec and UI |
| Dev tooling | `nodemon`, `ts-node` | Auto-reload dev server |

`axios` is listed as a dependency but is not imported anywhere in `src/`.

---

## 3. Getting Started

### Prerequisites

- Node.js (recent version; the dev script uses the ts-node ESM loader, see [Known gaps](#12-known-gaps-and-suggestions))
- npm
- A running MongoDB instance (local or hosted)
- Optional: a Google Gemini API key for AI summaries/tags

### Installation

```bash
git clone https://github.com/Alexander-OE/articulink.git
cd articulink
npm install
cp .env.example .env   # then fill in the values
```

### Environment variables

From `.env.example`:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port the server listens on. If unset, the code defaults to **4000**. |
| `MONGO_URI` | Yes | MongoDB connection string, e.g. `mongodb://localhost:27017/articulink`. If missing, the connection fails and the process exits with code 1. |
| `GEMINI_API_KEY` | No | Enables Gemini summaries/tags. Without it, fallbacks are used. |

### Scripts (`package.json`)

| Script | Command | Notes |
| --- | --- | --- |
| `npm run dev` | `nodemon --watch src --ext ts,json --ignore dist --exec "node --loader ts-node/esm --experimental-specifier-resolution=node ./src/app.ts"` | Dev server with reload on changes in `src/`. |
| `npm test` | placeholder | Prints "no test specified" and exits 1. There are no tests. |

**There is no `build` or `start` script**, and `tsconfig.json` has `rootDir`/`outDir` commented out, so there is currently no defined build or production run command. Production would need a build step added (see [Known gaps](#12-known-gaps-and-suggestions)).

Once running: `http://localhost:<PORT>/docs` for the Swagger UI.

---

## 4. Project Structure

```
articulink/
├── src/
│   ├── app.ts                    # Express app setup, route mounting, startup (DB connect then listen)
│   ├── config/
│   │   ├── db.ts                 # connectDB(): Mongoose connection, exits process on failure
│   │   └── swagger.ts            # OpenAPI definition + component schemas; scans routes/*.ts for @openapi JSDoc
│   ├── controllers/
│   │   ├── articles.controller.ts      # create, list, search, trending, get by id, stats
│   │   ├── interactions.controller.ts  # create interaction
│   │   └── users.controller.ts         # create, get, activity, recommendations
│   ├── middleware/
│   │   └── errorHandler.ts      # AppError class, notFound (404) handler, central errorHandler
│   ├── models/
│   │   ├── Article.ts            # Article schema (+ text index)
│   │   ├── Interaction.ts        # Interaction schema
│   │   └── User.ts               # User schema
│   ├── routes/
│   │   ├── articles.route.ts     # /articles routes + Swagger annotations
│   │   ├── interactions.route.ts # /interactions routes + Swagger annotations
│   │   └── users.route.ts        # /users routes + Swagger annotations
│   ├── utils/
│   │   ├── asyncHandler.ts       # Forwards async errors to the error handler
│   │   ├── generateSummary.ts    # Gemini summary with truncation fallback
│   │   ├── generateTags.ts       # Gemini tags with keyword-frequency fallback
│   │   └── paginator.ts          # buildPaginationResponse() -> { data, meta }
│   └── validators/
│       ├── articles.validator.ts      # Joi schemas: create, list query, search query, trending query
│       ├── interactions.validator.ts  # Joi schema: create interaction
│       └── users.validator.ts         # Joi schemas: create user, list query (unused)
├── .env.example
├── .gitignore                    # node_modules, .env, .DS_Store
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 5. Data Models

All models use Mongoose `timestamps: true`, so each document also has `createdAt` and `updatedAt` (set automatically), plus the MongoDB `_id` and `__v`.

### Article (collection `articles`)

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | String | Yes | none | Trimmed. |
| `content` | String | Yes | none | |
| `author` | String | Yes | none | Free text, not a reference to User. |
| `summary` | String | No | `""` | Auto-generated by the API if omitted on create. |
| `tags` | [String] | No | `[]` | Indexed. Auto-generated by the API if omitted/empty on create. |

Indexes: single-field index on `tags`; text index on `title`, `content`, `tags` (powers `/articles/search`).

### User (collection `users`)

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `username` | String | Yes | none | Trimmed, **unique**. |
| `interests` | [String] | No | `[]` | Used by recommendations; matched against article tags. |

### Interaction (collection `interactions`)

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId (ref `User`) | Yes | none | |
| `articleId` | ObjectId (ref `Article`) | Yes | none | |
| `interactionType` | String enum `view` / `like` / `share` | Yes | none | |

No uniqueness constraint: the same user can create unlimited identical interactions.

### Relationships

- A **User** has many **Interactions**; an **Article** has many **Interactions**. `Interaction` is the join between them (`userId` -> User, `articleId` -> Article).
- `Article.author` is a plain string, not linked to a User.
- User interests and Article tags are both free-text strings; recommendations match them by exact string equality.
- There are no cascading deletes (no delete endpoints exist).

---

## 6. API Reference

Base URL (dev): `http://localhost:<PORT>` (default 4000 if `PORT` unset). No version prefix. All request/response bodies are JSON. No endpoint requires authentication.

Pagination query parameters `limit` / `offset` are validated by Joi; invalid values give a 400. Unknown query parameters are stripped (ignored).

### Summary

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Service banner |
| GET | `/health` | Liveness probe |
| GET | `/docs` | Swagger UI |
| GET | `/docs.json` | Raw OpenAPI spec |
| POST | `/articles` | Create article |
| GET | `/articles` | List articles (paginated, `tag` filter) |
| GET | `/articles/search` | Full-text search |
| GET | `/articles/trending` | Trending articles |
| GET | `/articles/:id` | Get article |
| GET | `/articles/:id/stats` | Engagement stats |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| GET | `/users/:id/activity` | Recent interactions |
| GET | `/users/:id/recommendations` | Recommendations |
| POST | `/interactions` | Record interaction |

### System

#### `GET /`
Response `200`: `{ "name": "Articulink", "status": "ok" }`

#### `GET /health`
Response `200`:
```json
{ "status": "ok", "uptime": 123.45, "timestamp": 1760000000000 }
```
`uptime` is seconds (`process.uptime()`); `timestamp` is epoch milliseconds. It does not check the database.

#### `GET /docs` and `GET /docs.json`
Swagger UI (HTML) and the OpenAPI 3.0.3 document (JSON). See [section 10](#10-api-documentation-swagger).

### Articles

#### `POST /articles`

Body:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | max 500 chars, non-empty |
| `content` | string | Yes | non-empty |
| `author` | string | Yes | max 200 chars, non-empty |
| `summary` | string / null / `""` | No | If missing, null or blank, generated |
| `tags` | string[] | No | If missing or empty, generated |

Unknown body fields are rejected (Joi default), returning 400.

Example request:
```bash
curl -X POST http://localhost:4000/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"The Rise of AI in Modern Software","content":"Artificial intelligence is transforming software...","author":"Jane Doe"}'
```
Response `201` (the created document):
```json
{
  "_id": "6abf9efe93a9d71c5e5de0b5",
  "title": "The Rise of AI in Modern Software",
  "content": "Artificial intelligence is transforming software...",
  "author": "Jane Doe",
  "summary": "AI is reshaping how software is built...",
  "tags": ["software", "artificial intelligence"],
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z",
  "__v": 0
}
```
Errors: `400` with `{ "error": ["\"title\" is required", ...] }` (array of messages, all errors reported).

#### `GET /articles`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `limit` | integer | 10 | 1-100 |
| `offset` | integer | 0 | >= 0 |
| `tag` | string | none | Exact, case-sensitive match against `tags` |

Sorted newest first (`createdAt` desc). Response `200`:
```json
{
  "data": [ { "_id": "...", "title": "...", "tags": ["..."], "...": "..." } ],
  "meta": { "total": 42, "limit": 10, "offset": 0 }
}
```
Errors: `400` (array of messages).

#### `GET /articles/search?q=`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `q` | string | required | 1-200 chars |
| `limit` | integer | 10 | 1-100 |
| `offset` | integer | 0 | >= 0 |

Uses MongoDB `$text` search, sorted by text relevance. Each returned article has an extra `score` field (the text score). Response shape is the same `{ data, meta }` as the list. Errors: `400`.

#### `GET /articles/trending`

| Query | Type | Default | Rules |
| --- | --- | --- | --- |
| `days` | integer | 7 | 1-365 |
| `limit` | integer | 10 | 1-50 |

Response `200`:
```json
{
  "data": [
    { "article": { "_id": "...", "title": "..." }, "score": 24, "views": 10, "likes": 4, "shares": 0 }
  ],
  "meta": { "days": 7, "limit": 10 }
}
```
Note: `meta` has no `total`/`offset`; this endpoint is not paginated. Only articles with at least one interaction in the window appear. Errors: `400`.

#### `GET /articles/:id`
Returns the article document (same shape as in `POST /articles`). Errors: `400 {"error":"invalid_id"}`, `404 {"error":"not_found"}`.

#### `GET /articles/:id/stats`
Response `200`:
```json
{ "articleId": "6abf9efe93a9d71c5e5de0b5", "stats": { "views": 12, "likes": 4, "shares": 1, "total": 17 } }
```
Errors: `400 invalid_id`, `404 not_found`. Counts are all-time.

### Users

#### `POST /users`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `username` | string | Yes | alphanumeric only, 3-30 chars, unique |
| `interests` | string[] | No | |

Example:
```bash
curl -X POST http://localhost:4000/users -H "Content-Type: application/json" \
  -d '{"username":"reader42","interests":["technology","ai"]}'
```
Response `201`:
```json
{ "_id": "6abf9f1993a9d71c5e5de0b7", "username": "reader42", "interests": ["technology","ai"],
  "createdAt": "...", "updatedAt": "...", "__v": 0 }
```
Errors: `400` validation (array of messages); `400 {"error":"username_already_exists"}` on duplicate (note: 400, not 409).

#### `GET /users/:id`
Returns the user document. Errors: `400 invalid_id`, `404 not_found`.

#### `GET /users/:id/activity`
Returns up to the **50** most recent interactions (newest first), with `articleId` populated to `{ _id, title, author, tags }`. Not paginated.
```json
{
  "userId": "6abf9f1993a9d71c5e5de0b7",
  "interactions": [
    { "_id": "...", "userId": "...", "articleId": { "_id": "...", "title": "...", "author": "...", "tags": ["..."] },
      "interactionType": "like", "createdAt": "...", "updatedAt": "...", "__v": 0 }
  ]
}
```
If an article was deleted from the database, the populated `articleId` would be `null` (no delete endpoint exists today). Errors: `400 invalid_id`, `404 not_found`.

#### `GET /users/:id/recommendations`
No query parameters; result size is fixed at 10.
```json
{
  "userId": "6abf9f1993a9d71c5e5de0b7",
  "strategy": "personalized",
  "matchedInterests": ["technology", "ai", "software"],
  "data": [ { "_id": "...", "title": "...", "tags": ["..."] } ]
}
```
`strategy` is `"personalized"` or `"fallback_recent"`. See [section 9](#9-utilities-and-special-logic). Errors: `400 invalid_id`, `404 not_found`.

### Interactions

#### `POST /interactions`

Note the **snake_case** body fields (the stored/returned fields are camelCase).

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `user_id` | string | Yes | Valid ObjectId; user must exist |
| `article_id` | string | Yes | Valid ObjectId; article must exist |
| `interaction_type` | string | Yes | `view`, `like` or `share` |

Example:
```bash
curl -X POST http://localhost:4000/interactions -H "Content-Type: application/json" \
  -d '{"user_id":"6abf9f1993a9d71c5e5de0b7","article_id":"6abf9efe93a9d71c5e5de0b5","interaction_type":"like"}'
```
Response `201`:
```json
{ "_id": "...", "userId": "6abf9f1993a9d71c5e5de0b7", "articleId": "6abf9efe93a9d71c5e5de0b5",
  "interactionType": "like", "createdAt": "...", "updatedAt": "...", "__v": 0 }
```
Errors: `400` validation (array); `400 invalid_id`; `404 user_not_found`; `404 article_not_found`.

---

## 7. Authentication and Authorization

**None exists.** There are no login endpoints, tokens, sessions, API keys or auth middleware. Every endpoint is public. Users are identified only by the `_id` the client passes in the URL (`/users/:id/...`) or body (`user_id`), and nothing verifies that the caller is that user.

The only global middleware is `express.json()`, `helmet()` and `morgan("dev")` (plus the error handlers).

---

## 8. Error Handling

Implemented in [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts) and [src/utils/asyncHandler.ts](src/utils/asyncHandler.ts).

**Format:** always `{ "error": ... }`.

| Situation | Status | Body |
| --- | --- | --- |
| Joi validation failure | 400 | `{ "error": ["message", ...] }` (**array** of strings) |
| Invalid ObjectId | 400 | `{ "error": "invalid_id" }` |
| Duplicate username | 400 | `{ "error": "username_already_exists" }` |
| Article/user not found | 404 | `{ "error": "not_found" }` |
| Interaction with unknown user / article | 404 | `{ "error": "user_not_found" }` / `{ "error": "article_not_found" }` |
| Unmatched route | 404 | `{ "error": "route_not_found", "path": "/original/url" }` |
| Unexpected error | 500 | `{ "error": "internal_server_error" }` (details logged server-side only) |

How it works: controllers throw `AppError(message, status)`; `asyncHandler` forwards rejected promises to `errorHandler`, which returns `err.message` for any status < 500 and the generic message for 5xx. Errors from Express itself that carry a `status` (for example malformed JSON bodies from `express.json()`) also pass through with their own status and message. **Validation errors return an array while all other errors return a string**, so a client should handle both.

---

## 9. Utilities and Special Logic

- **Summary generation** ([generateSummary.ts](src/utils/generateSummary.ts)): if `GEMINI_API_KEY` is set, asks `gemini-1.5-flash` for a 2-3 sentence summary. Otherwise (or on any error, which is logged) returns the first 50 whitespace-separated words of the content followed by `...`.
- **Tag generation** ([generateTags.ts](src/utils/generateTags.ts)): asks Gemini for 3-6 comma-separated tags. Output is lowercased, stripped of everything except letters, digits, spaces and hyphens, de-duplicated, and capped at 6. Fallback (no key, error, or empty result): take title + content, keep words longer than 3 characters that are not in a small stopword list, rank by frequency, and use the top 6.
- **Summary/tags on create**: both are only generated when missing (blank summary / empty tags), and run in parallel. Client-supplied tags are stored as-is (not normalised).
- **Pagination** ([paginator.ts](src/utils/paginator.ts)): offset-based. `buildPaginationResponse(data, total, limit, offset)` returns `{ data, meta: { total, limit, offset } }`. Used by `GET /articles` and `GET /articles/search`. There is no "next page" link or page count; compute from `total`, `limit`, `offset`.
- **Async handler** ([asyncHandler.ts](src/utils/asyncHandler.ts)): wraps async controllers so rejected promises reach the error middleware (Express 5 does this natively for async handlers, so it is a belt-and-braces measure).
- **Trending score**: within the last `days` days, `score = shares*5 + likes*3 + views*1` per article; sorted by score descending, limited by `limit`.
- **Recommendations**: (1) collect the articles the user has interacted with (any type) as "seen"; (2) build a tag set from the user's `interests` plus the tags of seen articles; (3) return up to 10 unseen articles whose tags overlap the set, newest first (`strategy: "personalized"`); (4) if none, return the 10 newest unseen articles (`strategy: "fallback_recent"`). `matchedInterests` is the tag set used.

---

## 10. API Documentation (Swagger)

- **Swagger UI:** `http://localhost:<PORT>/docs` (page title "Articulink API Docs")
- **Raw OpenAPI 3.0.3 spec:** `http://localhost:<PORT>/docs.json`

The spec is built by `swagger-jsdoc` from the component schemas in [src/config/swagger.ts](src/config/swagger.ts) plus `@openapi` JSDoc comments in `src/routes/*.ts`. The raw spec is handy for generating a typed frontend client. `/docs` is mounted before `helmet` so the UI's assets aren't blocked by the default CSP.

---

## 11. Notes for Frontend Development

- **Base URL / port:** `http://localhost:<PORT>`, where `PORT` defaults to **4000** in code. The Swagger `servers` entry hard-codes `http://localhost:3000`, so "Try it out" in `/docs` only works if you run on port 3000 (set `PORT=3000`) or edit that entry.
- **CORS: not configured.** No `cors` package or headers are present. A browser frontend on a different origin will be blocked until CORS is added to the backend (or you use a dev proxy, e.g. Vite/Next proxy to the API).
- **Request format:** `Content-Type: application/json`. Interaction creation uses snake_case fields (`user_id`, `article_id`, `interaction_type`); everything else is camelCase.
- **Response format:** documents are returned as raw Mongoose JSON: `_id` (string), `createdAt`, `updatedAt` (ISO dates) and `__v`. Lists are `{ data, meta }`; the single-resource endpoints return the document directly; recommendations/activity/trending/stats use their own wrapper objects (see section 6).
- **Pagination:** `limit`/`offset` with `meta.total`. Trending, activity and recommendations are not paginated.
- **Auth flow:** none. There is no login or session; the UI must create a user via `POST /users` and keep the returned `_id` (e.g. in local storage) to use in `/users/:id/...` and `user_id`. There is no "find user by username" or list-users endpoint, so a lost `_id` cannot be recovered through the API.
- **Likely UI flows:** home feed `GET /articles` / `GET /articles/trending`; search `GET /articles/search?q=`; tag chips filter via `?tag=`; article page `GET /articles/:id` + `/stats`, then `POST /interactions` with `view` on open and `like`/`share` on actions; "For you" `GET /users/:id/recommendations`; history `GET /users/:id/activity`.
- **Behaviours to design around:** creating an article can be slow when Gemini is used (it awaits the AI call); duplicate usernames return 400; interactions are not de-duplicated (a user can "like" repeatedly, and each counts); `tag` filtering is case-sensitive and exact; validation errors are arrays, other errors are strings.
- **Security headers:** `helmet` defaults are applied to all routes except `/docs*`.

---

## 12. Known Gaps and Suggestions

Observed in the code (not fixed here):

1. **No CORS** configured (see above); required for a browser frontend.
2. **No authentication/authorization**; any caller can act as any user.
3. **No `build` / `start` scripts** and no `outDir` in `tsconfig.json`; production run is undefined. Also `swagger.ts` scans `routes/*.ts`, which would find nothing if the code were compiled to `.js` files without adjusting the glob.
4. **Dev script relies on `--experimental-specifier-resolution=node`**, a flag removed in newer Node.js versions; the `node --loader ts-node/esm` setup may fail depending on your Node version. Not verified by running.
5. **No tests** (`npm test` is a placeholder).
6. **Port mismatch:** code default is 4000; Swagger server URL and the previous README used 3000.
7. **Missing endpoints:** no update/delete for articles or users, no list-users or lookup-by-username, no interaction listing or removal ("unlike").
8. **`listQuerySchema`** in `users.validator.ts` is defined but never used. `axios` is an unused dependency; several `@types/*` packages (`axios`, `helmet`, `joi`) are deprecated stubs as those libraries ship their own types.
9. **Interactions aren't de-duplicated** (repeated likes/views inflate stats and trending), and there is no unique index or rate limiting.
10. **Duplicate username returns 400**; 409 would be more conventional.
11. **Inconsistent error shapes** (array vs string) and no machine-readable error codes for validation errors.
12. **Swagger docs are incomplete in places**: for example `400 invalid_id` is documented on `/articles/{id}` but not on `/articles/{id}/stats` or the user routes; the `score` field returned by search is not in the `Article` schema.
13. **Gemini model `gemini-1.5-flash` is hard-coded** and may be retired or deprecated by Google; consider making it a configurable env var. Gemini calls have no timeout.
14. **Recommendations/activity sizes are fixed** (10 and 50) and not configurable; `tags`/interests matching is exact and case-sensitive (user interests and client-supplied tags are not normalised).
15. **`MONGO_URI` falls back to an empty string** when unset, producing a generic connection error rather than a clear "missing variable" message.
16. **`/health` does not check the database connection.**
17. `generateSummary.ts` has a stale header comment (`src/services/summary.service.ts`); source files are inconsistently formatted/indented (the models and validators lack indentation).
18. The `updatedAt` field is included in the Swagger `Interaction` schema, but the TypeScript `IInteraction` interface only declares `createdAt` (types only; both are stored).
