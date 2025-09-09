# Enterprise AI Portal v2 (gpt3) - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [User Interface & Features](#user-interface--features)
- [API Documentation](#api-documentation)
- [AI Integration](#ai-integration)
- [Admin Panel](#admin-panel)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Enterprise AI Portal v2** เป็นแพลตฟอร์มแชท AI สำหรับองค์กรที่ออกแบบมาเพื่อให้บริษัทสามารถใช้งาน AI Chat แบบ Enterprise-grade ได้อย่างปลอดภัยและมีประสิทธิภาพ

### วัตถุประสงค์หลัก
- **แชท AI แบบสตรีม** - ประสบการณ์คล้าย ChatGPT พร้อมการตอบกลับแบบเรียลไทม์
- **ระบบจัดการผู้ใช้** - Admin Panel สำหรับจัดการผู้ใช้ สิทธิ์ และโมเดล AI
- **ความปลอดภัยระดับองค์กร** - ระบบ RBAC (Role-Based Access Control)
- **การติดตามและ Audit** - บันทึกการใช้งานและสถิติต่างๆ
- **การแยกความคิดและคำตอบ** - แสดงผลกระบวนการคิดของ AI แยกจากคำตอบจริง

### คุณสมบัติเด่น
- ✅ **Real-time Streaming** - การตอบกลับแบบ NDJSON streaming
- ✅ **Role-Based Access Control** - ระบบสิทธิ์แบบยืดหยุ่น
- ✅ **Multi-Model Support** - รองรับหลายโมเดล AI
- ✅ **Dark/Light Mode** - ธีมสลับได้
- ✅ **Mobile Responsive** - รองรับทุกอุปกรณ์
- ✅ **Activity Logging** - บันทึกการใช้งานครบถ้วน
- ✅ **Performance Monitoring** - ติดตามประสิทธิภาพ

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Next.js 15** - App Router (Server/Client Components)
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling Framework
- **next-themes** - Dark/Light Mode
- **Lucide React** - Icons
- **React Markdown** - Markdown Rendering

### Backend
- **Next.js API Routes** - Server-side Logic
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database Management
- **bcryptjs** - Password Hashing
- **Zod** - Schema Validation

### Database
- **SQLite** (Development) / **PostgreSQL** (Production)
- **Prisma Migrations** - Schema Management

### AI Integration
- **Ollama** - Local AI Model Server
- **NDJSON Streaming** - Real-time Response
- **Custom Model Management** - Model Catalog

### Testing & Quality
- **Playwright** - End-to-End Testing
- **Vitest** - Unit Testing
- **Testing Library** - Component Testing
- **ESLint** - Code Linting

---

## 🗄️ Database Schema

### Core Models

#### User Management
```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  image         String?
  passwordHash  String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  roles         UserRole[]
  chats         Chat[]
  activityLogs  ActivityLog[]
}

model Role {
  id               String            @id @default(cuid())
  name             String            @unique
  description      String?
  createdAt        DateTime          @default(now())
  users            UserRole[]
  rolePermissions  RolePermission[]
}

model Permission {
  id          String            @id @default(cuid())
  key         String            @unique
  description String?
  createdAt   DateTime          @default(now())
  roleLinks   RolePermission[]
}
```

#### Chat System
```prisma
model Chat {
  id        String    @id @default(cuid())
  userId    String
  title     String?
  modelId   String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  model     Model?    @relation(fields: [modelId], references: [id])
  messages  Message[]
  requests  RequestLog[]
}

model Message {
  id        String      @id @default(cuid())
  chatId    String
  role      MessageRole @default(user)
  content   String
  modelId   String?
  tokens    Int?
  createdAt DateTime    @default(now())
  
  chat      Chat        @relation(fields: [chatId], references: [id], onDelete: Cascade)
  model     Model?      @relation(fields: [modelId], references: [id])
}

enum MessageRole {
  user
  assistant
  system
  tool
}
```

#### AI Models
```prisma
model Model {
  id            String    @id // e.g. "llama3:latest" or "gpt-4o"
  provider      String    // e.g. "ollama", "openai"
  label         String?
  contextLength Int?
  temperature   Float?
  enabled       Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  chats        Chat[]
  messages     Message[]
  requests     RequestLog[]
}
```

#### Logging & Monitoring
```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  target    String?
  metadata  Json?
  createdAt DateTime @default(now())
  
  user      User?    @relation(fields: [userId], references: [id])
}

model RequestLog {
  id               String   @id @default(cuid())
  chatId           String?
  modelId          String?
  durationMs       Int?
  promptTokens     Int?
  completionTokens Int?
  totalTokens      Int?
  success          Boolean  @default(true)
  error            String?
  createdAt        DateTime @default(now())
  
  chat             Chat?    @relation(fields: [chatId], references: [id])
  model            Model?   @relation(fields: [modelId], references: [id])
}

model ErrorLog {
  id        String   @id @default(cuid())
  level     String?
  message   String
  stack     String?
  context   Json?
  createdAt DateTime @default(now())
}
```

---

## 🔐 Authentication & Authorization

### NextAuth Configuration
- **Strategy**: JWT Sessions
- **Provider**: Credentials (Email/Password)
- **Adapter**: Prisma Adapter
- **Middleware**: Route Protection

### Role-Based Access Control (RBAC)
```typescript
// Default Roles
- admin: Full system access
- user: Standard user access

// Permission System
- Flexible permission assignment
- Role-based access control
- Middleware protection for routes
```

### Protected Routes
- `/admin/*` - Requires `admin` role
- `/chat/*` - Requires authentication
- `/api/admin/*` - Requires `admin` role

---

## 🎨 User Interface & Features

### Chat Interface (`/chat/[id]`)

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: Enterprise AI Assistant + Model Selector       │
├─────────────────────────────────────────────────────────┤
│ Sidebar (Desktop)    │ Main Chat Area                  │
│ - New Chat Button    │ - Message History               │
│ - Recent Chats       │ - Thinking Box (if applicable)  │
│ - User Account       │ - Streaming Response            │
│                      │ - Input Area                    │
├─────────────────────────────────────────────────────────┤
│ Mobile Bottom Bar: Chats | Recent | User | Settings    │
└─────────────────────────────────────────────────────────┘
```

#### Key Features
- **Real-time Streaming** - NDJSON response streaming
- **Model Selection** - Dropdown with available models
- **Thinking Display** - Shows AI reasoning process
- **Message History** - Persistent chat history
- **Dark/Light Mode** - Theme switching
- **Mobile Responsive** - Touch-friendly interface

#### Message Types
1. **User Messages** - Right-aligned, blue background
2. **Assistant Messages** - Left-aligned, white background
3. **Thinking Box** - Dashed border, semi-transparent
4. **Streaming Indicator** - Animated dots with cancel button

### Admin Panel (`/admin`)

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Admin Header: Enterprise AI Admin + Navigation         │
├─────────────────────────────────────────────────────────┤
│ Sidebar (Desktop)    │ Main Content Area               │
│ Management:          │ - Dashboard Cards               │
│ - Users              │ - Recent Activity               │
│ - Permissions        │ - Quick Actions                 │
│ - Model Config       │ - Analytics Charts              │
│ Monitoring:          │                                 │
│ - Usage Analytics    │                                 │
│ - Error Logs         │                                 │
│ - Performance        │                                 │
│ Settings:            │                                 │
│ - System Settings    │                                 │
│ - Security           │                                 │
└─────────────────────────────────────────────────────────┘
```

#### Admin Features
- **User Management** - Create, edit, assign roles
- **Role & Permission Management** - Flexible RBAC
- **Model Configuration** - Add, enable/disable models
- **Activity Monitoring** - User activity logs
- **Performance Metrics** - System performance data
- **Error Logging** - System error tracking

---

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/signin
GET  /api/auth/signout
GET  /api/auth/session
```

### Chat Endpoints
```
GET    /api/chats                    # List user's chats
POST   /api/chats                    # Create new chat
GET    /api/chats/[id]               # Get chat details
PATCH  /api/chats/[id]               # Update chat
DELETE /api/chats/[id]               # Delete chat

POST   /api/chat/[id]/message        # Send message (streaming)
PATCH  /api/chat/[id]/model          # Update chat model
```

### Model Endpoints
```
GET    /api/models                   # List all models
POST   /api/models                   # Create new model
GET    /api/models/[id]              # Get model details
PATCH  /api/models/[id]              # Update model
DELETE /api/models/[id]              # Delete model

GET    /api/integrations/ollama/models # Get Ollama models
```

### Admin Endpoints
```
# User Management
GET    /api/admin/users              # List users (with search)
PATCH  /api/admin/users/[id]/roles   # Update user roles

# Role Management
GET    /api/admin/roles              # List roles
POST   /api/admin/roles              # Create role
DELETE /api/admin/roles/[id]         # Delete role

# Permission Management
GET    /api/admin/permissions        # List permissions
POST   /api/admin/permissions        # Create permission
PATCH  /api/admin/roles/[id]/permissions # Update role permissions
```

### Streaming Response Format
```json
{"type": "start"}
{"type": "thinking", "data": "AI reasoning process..."}
{"type": "delta", "data": "Response content..."}
{"type": "done", "id": "message_id", "tokens": {"prompt": 10, "completion": 20, "total": 30}}
{"type": "error", "error": "Error message"}
```

---

## 🤖 AI Integration

### Ollama Integration
- **Base URL**: `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
- **Model Discovery**: Automatic model detection from Ollama
- **Streaming**: NDJSON response streaming
- **Error Handling**: Graceful fallback for unavailable models

### Model Management
- **Automatic Registration**: Models auto-registered when selected
- **Configuration**: Context length, temperature, provider
- **Enable/Disable**: Toggle model availability
- **Labeling**: Custom display names for models

### Thinking Process Display
- **Tag Parsing**: Extracts `<think>...</think>` content
- **Separate Display**: Shows thinking in dedicated box
- **Real-time Updates**: Streaming thinking content
- **Visual Distinction**: Dashed border, semi-transparent

### Response Processing
```typescript
// Streaming Logic
while (!done) {
  const { value, done: d } = await reader.read();
  done = d;
  if (value) {
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n").filter(Boolean)) {
      const evt = JSON.parse(line);
      if (evt.response) {
        // Process <think> tags
        if (inThink) {
          await writeEvent({ type: "thinking", data: content });
        } else {
          await writeEvent({ type: "delta", data: content });
        }
      }
    }
  }
}
```

---

## 👨‍💼 Admin Panel

### Dashboard Features
- **Active Users** - Current user count
- **Daily Queries** - Query statistics
- **Model Accuracy** - Performance metrics
- **Response Time** - Average response time
- **Recent Activity** - User activity feed
- **Quick Actions** - Common admin tasks

### User Management
- **User List** - Searchable user directory
- **Role Assignment** - Assign/remove roles
- **User Creation** - Add new users
- **Activity Tracking** - User action logs

### Role & Permission Management
- **Role Creation** - Create custom roles
- **Permission Assignment** - Assign permissions to roles
- **Flexible RBAC** - Granular access control
- **Role Hierarchy** - Multiple role support

### Model Configuration
- **Model Catalog** - Manage AI models
- **Provider Support** - Multiple AI providers
- **Configuration** - Context length, temperature
- **Enable/Disable** - Toggle model availability

### Monitoring & Analytics
- **Usage Statistics** - User activity metrics
- **Performance Monitoring** - Response times, token usage
- **Error Logging** - System error tracking
- **Activity Logs** - User action auditing

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Ollama (for AI models)
- SQLite (development) or PostgreSQL (production)

### 1. Clone Repository
```bash
git clone https://github.com/ton-apicha/gpt3.git
cd gpt3
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Environment Configuration
Create `.env.local`:
```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration
OLLAMA_BASE_URL="http://localhost:11434"
```

For Prisma CLI, also create `.env`:
```bash
cp .env.local .env
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate -- --name init

# Seed initial data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Application
- **Application**: http://localhost:3000
- **Admin Login**: admin@example.com / admin123

---

## ⚙️ Configuration

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"                    # SQLite (dev)
DATABASE_URL="postgresql://..."                 # PostgreSQL (prod)

# Authentication
NEXTAUTH_SECRET="your-secret-key"               # JWT secret
NEXTAUTH_URL="http://localhost:3000"            # App URL

# AI Integration
OLLAMA_BASE_URL="http://localhost:11434"        # Ollama server
```

### Database Configuration

#### SQLite (Development)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### PostgreSQL (Production)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull models
ollama pull llama3.1:8b
ollama pull llama3.1:70b
```

---

## 🧪 Testing

### Test Structure
```
tests/
├── chat.spec.ts              # Basic chat functionality
├── chat-ui.spec.ts           # Chat UI interactions
├── chat-e2e-full.spec.ts     # Complete chat flow
├── admin.spec.ts             # Admin panel tests
├── api.models.test.ts        # API model tests
└── chatComposer.test.tsx     # Component tests
```

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npx playwright test

# Test with UI
npm run test:ui
```

### Test Coverage
- **Authentication Flow** - Login/logout
- **Chat Functionality** - Message sending, streaming
- **Admin Operations** - User management, model config
- **API Endpoints** - All REST endpoints
- **UI Components** - React component testing

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
```env
# Production Environment
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
OLLAMA_BASE_URL="http://ollama-server:11434"
```

### Database Migration
```bash
# Production migration
npx prisma migrate deploy

# Or development migration
npx prisma migrate dev
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check database file
ls -la prisma/dev.db

# Reset database
rm prisma/dev.db
npm run prisma:migrate -- --name init
npm run db:seed
```

#### 2. Ollama Connection
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

#### 3. Authentication Issues
```bash
# Check session
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/auth/session

# Clear cookies and retry
```

#### 4. Build Issues
```bash
# Clear cache
rm -rf .next
npm run build

# Check TypeScript
npx tsc --noEmit
```

### Performance Optimization

#### Database
- Use PostgreSQL for production
- Add database indexes for frequent queries
- Implement connection pooling

#### Caching
- Enable Next.js caching
- Use Redis for session storage
- Implement API response caching

#### Monitoring
- Set up error tracking (Sentry)
- Monitor database performance
- Track API response times

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Ollama Documentation](https://ollama.ai/docs)

### Community
- [GitHub Repository](https://github.com/ton-apicha/gpt3)
- [Issue Tracker](https://github.com/ton-apicha/gpt3/issues)
- [Discussions](https://github.com/ton-apicha/gpt3/discussions)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **Ollama Team** - For the local AI server
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons

---

*Last updated: January 2025*
*Version: 2.0.0*
