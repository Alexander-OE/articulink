# Articulink  
### Smart Content Aggregator (Backend)

A backend service for aggregating and managing articles with user interactions.  
Built with **TypeScript, Express.js, MongoDB, and Joi**, with **AI-powered summarization (Gemini)**.  

This project demonstrates clean architecture, request validation, and integration of **AI/ML for automatic article summaries**.  

---

## ✨ Features

- **Articles**
  - Create, read, and paginate articles.
  - Auto-generate article summaries using **Gemini AI**.
- **Users**
  - Register and manage users.
- **Interactions**
  - Record article interactions (likes, views, etc.).
- **Validation**
  - Input validation with **Joi**.

---

## 🗂️ Project Structure

```
articulink/
├── src/
│   ├── config/             # Configuration files (db, env, etc.)
│   │   └── db.ts
|   |
│   ├── controllers/        # Route handlers (articles, users, interactions)
│   │   ├── articles.controller.ts
│   │   ├── interactions.controller.ts
│   │   └── users.controller.ts
│   │
│   ├── models/             # Mongoose schemas
│   │   ├── Article.ts
│   │   ├── Interaction.ts
│   │   └── User.ts
│   │
│   ├── routes/             # Express routes
│   │   ├── articles.route.ts
│   │   ├── interactions.route.ts
│   │   └── users.route.ts
│   │
│   ├── utils/              # Helper functions 
|   |   ├── generateSummary.ts  # Gemini-powered summary generation
│   │   └── paginator.ts 
│   │
│   ├── validators/         # Joi schemas for request validation
│   │   ├── articles.validation.ts
│   │   ├── interactions.validation.ts
│   │   └── users.validation.ts
│   │
│   └── app.ts              # Express app initialization
│
├── .env.example            # Example environment variables
├── .gitignore
├── package-lock.json
├── package.json
├── tsconfig.json
└── README.md
```
---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Alexander-OE/articulink.git
cd articulink
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/articulink

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the App
```bash
npm run dev
```

---

### 🔧 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose)
- **Validation:** Joi
- **AI Integration:** Google Gemini API 

