# 🤖 Gemini-Based Multi-Project Chatbot Platform

A production-ready, ChatGPT-style conversational AI platform built with modern web technologies. This platform leverages Google Gemini for intelligent responses, implements secure file-augmented chat (RAG-style), and maintains a stateless, scalable architecture.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Core Concepts](#-core-concepts)
- [API Documentation](#-api-documentation)
- [Security & Best Practices](#-security--best-practices)
- [Troubleshooting](#-troubleshooting)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

This platform enables users to create multiple AI-powered chatbot projects, each with customizable system prompts and file-based context. Unlike traditional chatbot implementations, this system treats files as external context through Gemini's File API rather than storing them in your backend—resulting in a truly stateless, cost-effective, and compliant architecture.

### Why This Architecture?

**Traditional Approach Problems:**
- High storage costs (S3, database blobs)
- Complex file management and cleanup
- Compliance and data retention challenges
- Stateful backend complexity

**Our Solution:**
- Files uploaded directly to Gemini File API
- Only metadata (URI, MIME type) stored in database
- Zero storage costs for file content
- Simplified compliance (no PII/file storage)
- Easy LLM provider migration path

## ✨ Key Features

### 🔐 Robust Authentication
- **Google OAuth** - One-click social login
- **Email & Password** - Traditional credentials-based auth
- **NextAuth Integration** - Industry-standard session management
- **JWT-based** - Stateless authentication tokens

### 🧠 Advanced LLM Integration
- **Google Gemini** (`@google/genai` SDK)
- **Per-project system prompts** - Agent-like customizable behavior
- **Context windowing** - Smart chat history management for token optimization
- **File-augmented responses** - RAG-style context injection

### 📁 Intelligent File Management
- **Gemini File API** - External file hosting
- **Multiple file types** - Documents, images, PDFs, code files
- **Metadata-only storage** - No backend file persistence
- **Automatic context injection** - Files available to AI during conversations

### 💬 Modern Chat Experience
- **ChatGPT-style interface** - Familiar and intuitive UX
- **Multi-project support** - Organize conversations by project
- **Inline renaming** - Quick project name updates
- **File attachments** - Drag-and-drop file uploads
- **Responsive design** - Mobile and desktop optimized

### 🏗️ Clean Architecture
- **Service layer pattern** - Business logic separation
- **Stateless API routes** - Horizontal scalability
- **Strict ownership validation** - Resource-level access control
- **TypeScript throughout** - Type safety and IDE support

### 🛡️ Security-First Design
- **No backend file storage** - Reduced attack surface
- **Auth-guarded routes** - Every endpoint protected
- **Database user resolution** - Prevents JWT drift issues
- **Input validation** - Sanitized user inputs
- **CORS protection** - Secure cross-origin requests

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│                  (Next.js App Router)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Layer                       │
│                     (NextAuth + JWT)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
│              (Auth Guards + Validation)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│           (chat.service.ts, file.service.ts)               │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌─────────────────────────┐
│   PostgreSQL     │              │   Google Gemini APIs    │
│   (Metadata)     │              │  • Chat Completion      │
│                  │              │  • File API             │
└──────────────────┘              └─────────────────────────┘
```

### Request Flow

1. **Client Request** → User initiates action (send message, upload file)
2. **Auth Validation** → NextAuth verifies JWT and session
3. **API Route** → Request handler validates input and permissions
4. **Service Layer** → Business logic processes the request
5. **Database** → Metadata persisted (chat history, file refs)
6. **Gemini API** → LLM generates response or stores file
7. **Response** → Data flows back through layers to client

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14+ | React framework with App Router |
| **Language** | TypeScript 5.0+ | Type-safe development |
| **Authentication** | NextAuth.js | OAuth & credentials auth |
| **Database** | PostgreSQL 14+ | Relational data storage |
| **ORM** | Prisma 5.0+ | Type-safe database client |
| **AI/LLM** | Google Gemini | Conversational AI |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Deployment** | Vercel (recommended) | Serverless hosting |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Required API Keys

1. **Google Gemini API Key** - [Get it here](https://aistudio.google.com/app/apikey)
2. **Google OAuth Credentials** - [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gemini-chatbot-platform.git
cd gemini-chatbot-platform
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create a new database
createdb chatbot_platform

# Your connection string will be:
# postgresql://username:password@localhost:5432/chatbot_platform
```

**Option B: Cloud Database (Recommended for Production)**
- [Supabase](https://supabase.com/) - Free tier available
- [Neon](https://neon.tech/) - Serverless Postgres
- [Railway](https://railway.app/) - Easy deployment

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Node Environment
NODE_ENV="development"
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure consent screen
6. Set **Authorized JavaScript origins**: `http://localhost:3000`
7. Set **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
8. Copy **Client ID** and **Client Secret** to `.env`

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Get API Key**
3. Copy the key to `.env` as `GEMINI_API_KEY`

## 💾 Database Setup

### Initialize Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Database Schema Overview

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // Only for credentials auth
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
  sessions      Session[]
  accounts      Account[]
}

model Project {
  id           String   @id @default(cuid())
  name         String
  systemPrompt String?  // Custom AI behavior
  userId       String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chatSessions ChatSession[]
  files        ProjectFileReference[]
}

model ChatSession {
  id        String   @id @default(cuid())
  projectId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages  ChatMessage[]
}

model ChatMessage {
  id            String   @id @default(cuid())
  chatSessionId String
  role          String   // "user" | "assistant"
  content       String   @db.Text
  createdAt     DateTime @default(now())
  
  chatSession   ChatSession @relation(fields: [chatSessionId], references: [id], onDelete: Cascade)
}

model ProjectFileReference {
  id               String   @id @default(cuid())
  projectId        String
  geminiFileId     String   // Gemini's file URI
  mimeType         String
  originalFilename String
  uploadedAt       DateTime @default(now())
  
  project          Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

## 🎮 Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Type check with TypeScript
npx tsc --noEmit
```

## 📂 Project Structure

```
xaltypasta-chatbot-plat/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── .env                          # Environment variables
├── .env.example                  # Template for environment variables
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout (HTML structure)
    │   ├── page.tsx             # Landing/home page
    │   ├── globals.css          # Global styles
    │   ├── (auth)/              # Authentication routes group
    │   │   ├── login/
    │   │   │   └── page.tsx     # Login page
    │   │   └── signup/
    │   │       └── page.tsx     # Signup page
    │   ├── (dashboard)/         # Protected dashboard group
    │   │   ├── layout.tsx       # Dashboard layout with sidebar
    │   │   ├── Providers.tsx    # Client-side providers
    │   │   ├── sidebar.tsx      # Project navigation sidebar
    │   │   ├── UserDropDown.tsx # User menu component
    │   │   └── projects/
    │   │       ├── page.tsx     # Projects landing/redirect
    │   │       └── [projectId]/
    │   │           └── page.tsx # Chat interface for project
    │   └── api/                 # API routes
    │       ├── auth/
    │       │   ├── [...nextauth]/
    │       │   │   └── route.ts # NextAuth configuration
    │       │   └── signup/
    │       │       └── route.ts # User registration
    │       └── projects/
    │           ├── route.ts     # List/create projects
    │           ├── start/
    │           │   └── route.ts # Quick project creation
    │           └── [projectId]/
    │               ├── route.ts     # Update project (rename)
    │               ├── chat/
    │               │   └── route.ts # Send messages
    │               └── files/
    │                   └── route.ts # Upload files
    ├── lib/
    │   ├── auth/
    │   │   └── authOptions.ts   # NextAuth configuration
    │   ├── db/
    │   │   └── prisma.ts        # Prisma client singleton
    │   └── gemini/
    │       └── client.ts        # Gemini client initialization
    ├── services/
    │   ├── chat.service.ts      # Chat business logic
    │   └── file.service.ts      # File upload/management
    ├── types/
    │   ├── global.d.ts          # Global type definitions
    │   └── next-auth.d.ts       # NextAuth type extensions
    └── components/              # Reusable React components
        └── ui/                  # UI components (optional)
```

## 🧠 Core Concepts

### 1. Stateless Architecture

The platform is designed to be completely stateless:

- **No file storage**: Files live in Gemini's infrastructure
- **JWT authentication**: No server-side session store
- **Database for metadata only**: Chat history, file references
- **Horizontal scalability**: Can deploy multiple instances without coordination

### 2. File Management Strategy

**Traditional vs Our Approach:**

| Traditional | Our Approach |
|------------|--------------|
| Store in S3/Database | Upload to Gemini API |
| Manage lifecycle | Gemini handles it |
| Pay for storage | Zero storage cost |
| Complex cleanup | Auto-managed |
| Security concerns | Reduced surface area |

**File Upload Flow:**

```typescript
// 1. User uploads file from UI
const formData = new FormData();
formData.append('file', selectedFile);

// 2. API route receives file
const file = formData.get('file') as File;

// 3. Service uploads to Gemini
const geminiFile = await fileManager.uploadFile(file.stream(), {
  mimeType: file.type,
  displayName: file.name
});

// 4. Store only metadata
await prisma.projectFileReference.create({
  data: {
    projectId,
    geminiFileId: geminiFile.uri,
    mimeType: file.type,
    originalFilename: file.name
  }
});
```

### 3. Authentication Best Practice

**Critical Security Pattern:**

```typescript
// ❌ WRONG - Don't trust session.user.id directly
const project = await prisma.project.findUnique({
  where: { userId: session.user.id } // Vulnerable to JWT drift
});

// ✅ CORRECT - Always resolve via email
const dbUser = await prisma.user.findUnique({
  where: { email: session.user.email }
});

const project = await prisma.project.findUnique({
  where: { userId: dbUser.id } // Safe and consistent
});
```

**Why this matters:**
- OAuth providers may change user IDs
- JWT tokens can contain stale IDs
- Email is the stable identifier
- Prevents foreign key constraint errors

### 4. Chat History Windowing

To manage token limits and costs:

```typescript
// Fetch only recent messages (e.g., last 20)
const recentMessages = await prisma.chatMessage.findMany({
  where: { chatSessionId },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// Reverse for chronological order
const history = recentMessages.reverse();
```

### 5. System Prompts (Agent Behavior)

Each project can have a custom system prompt:

```typescript
const project = await prisma.project.findUnique({
  where: { id: projectId }
});

const systemPrompt = project.systemPrompt || 
  "You are a helpful AI assistant.";

// Used in Gemini chat
const chat = model.startChat({
  history: buildHistory(messages),
  systemInstruction: systemPrompt
});
```

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Project Endpoints

#### GET `/api/projects`
List all projects for authenticated user.

**Response:**
```json
{
  "projects": [
    {
      "id": "clx123",
      "name": "My First Project",
      "systemPrompt": "You are a coding assistant",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### POST `/api/projects`
Create a new project.

**Request:**
```json
{
  "name": "Research Assistant",
  "systemPrompt": "You help with academic research"
}
```

#### PATCH `/api/projects/[projectId]`
Rename a project.

**Request:**
```json
{
  "name": "Updated Project Name"
}
```

### Chat Endpoints

#### POST `/api/projects/[projectId]/chat`
Send a message and get AI response.

**Request:**
```json
{
  "message": "What is quantum computing?"
}
```

**Response:**
```json
{
  "reply": "Quantum computing is a type of computation that...",
  "messageId": "clx456"
}
```

### File Endpoints

#### POST `/api/projects/[projectId]/files`
Upload a file to project context.

**Request:** `multipart/form-data`
- `file`: The file to upload

**Response:**
```json
{
  "file": {
    "id": "clx789",
    "geminiFileId": "files/abc123",
    "originalFilename": "document.pdf",
    "mimeType": "application/pdf"
  }
}
```

## 🔒 Security & Best Practices

### Environment Security
- Never commit `.env` to version control
- Use `.env.example` as a template
- Rotate secrets regularly in production
- Use different secrets per environment

### Authentication Security
- Always validate sessions on API routes
- Implement rate limiting for auth endpoints
- Use HTTPS in production (enforced by Vercel)
- Set secure cookie flags in production

### Database Security
- Use connection pooling in production
- Enable SSL for database connections
- Implement row-level security where needed
- Regular backups (automated on managed platforms)

### Input Validation
- Sanitize all user inputs
- Validate file types and sizes
- Implement request size limits
- Use TypeScript for type safety

### Ownership Validation Pattern

```typescript
// Always check ownership before operations
const project = await prisma.project.findFirst({
  where: {
    id: projectId,
    userId: dbUser.id // Ensures user owns this project
  }
});

if (!project) {
  return new Response("Forbidden", { status: 403 });
}
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors

**Error:** `Can't reach database server`

**Solutions:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format
- Ensure database exists
- Check firewall/network settings

#### Gemini API Errors

**Error:** `API key not valid`

**Solutions:**
- Verify `GEMINI_API_KEY` in `.env`
- Check API key is active in Google AI Studio
- Ensure no extra spaces in the key

**Error:** `File upload failed`

**Solutions:**
- Check file size (Gemini has limits)
- Verify MIME type is supported
- Check API quota limits

#### NextAuth Errors

**Error:** `Invalid callback URL`

**Solutions:**
- Add callback URL to Google OAuth settings
- Ensure `NEXTAUTH_URL` matches your domain
- Check for trailing slashes

#### Build Errors

**Error:** `Type error: Cannot find module`

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debugging Tips

1. **Enable detailed logging:**
```typescript
// In chat.service.ts
console.log('Gemini Response:', JSON.stringify(result, null, 2));
```

2. **Check database state:**
```bash
npx prisma studio
```

3. **Verify file references:**
```sql
SELECT * FROM "ProjectFileReference" WHERE "projectId" = 'your-project-id';
```

4. **Test Gemini connectivity:**
```typescript
// Create a test endpoint
const model = gemini.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent("Hello");
console.log(result.response.text());
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env`
   - Update `NEXTAUTH_URL` to your Vercel domain

4. **Update OAuth Callback**
   - Add `https://your-app.vercel.app/api/auth/callback/google` to Google OAuth

5. **Deploy**
   - Vercel auto-deploys on push to main

### Railway / Render

Similar process with platform-specific configurations. Ensure:
- PostgreSQL database provisioned
- Environment variables configured
- Build command: `npm run build`
- Start command: `npm start`

## 🗺️ Future Roadmap

- [ ] **Streaming Responses** - Real-time token-by-token output
- [ ] **Project Settings UI** - Edit system prompts from interface
- [ ] **Team Collaboration** - Share projects with other users
- [ ] **Analytics Dashboard** - Token usage, message counts, costs
- [ ] **Multi-Model Support** - OpenAI, Anthropic, local models
- [ ] **Voice Input** - Speech-to-text integration
- [ ] **Export Conversations** - Download chat history
- [ ] **Advanced RAG** - Vector search and semantic retrieval
- [ ] **API Key Management** - User-provided API keys
- [ ] **Webhooks** - External integrations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow existing TypeScript patterns
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication



---

**Built with ❤️ using Next.js and Google Gemini**