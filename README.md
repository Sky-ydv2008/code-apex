# CodeCraft AI 🚀
### AI-Powered Collaborative Coding & Learning Platform
Developed by **Apex Innovators**

CodeCraft AI is a web-based collaborative programming platform where developers, students, and teams can code together in real time, execute code in isolated sandboxes, communicate in live coding rooms, and leverage AI capabilities for code explanation, debugging, automatic fix application, code generation, optimization, test case generation, hinting, and code review.

---

## 🌟 Core Features

- **Real-Time Collaborative Code Editor**: Synchronized multi-file text editing powered by Socket.IO & Yjs CRDTs, live user cursors, presence indicators, and file management.
- **8-in-1 AI Coding Assistant**:
  - 📖 **Explain Code**: Detailed logic breakdown, line-by-line explanation, and complexity analysis.
  - 🐛 **Debug**: AI diagnosis of syntax, logic, and runtime errors.
  - 🛠️ **1-Click Fix & Apply**: Instant correction generation with one-click direct application to the Monaco Editor.
  - ✨ **Generate**: Code creation from natural language requirements.
  - ⚡ **Optimize**: Algorithmic performance and code cleanliness enhancements.
  - 🧪 **Test Cases**: Automatic edge case and sample test generation.
  - 💡 **Hint System**: Progressive multi-step hints for learning and problem-solving.
  - 📊 **Code Quality Review**: Scoring card (0-100) assessing readability, correctness, complexity, and best practices.
- **Secure Sandbox Code Execution**: Sandboxed execution workers supporting **JavaScript (Node.js)** and **Python 3** with execution timeouts, memory/CPU controls, and safe execution output capturing (stdout/stderr).
- **Room & Team Collaboration**:
  - Room creation with unique 6-digit join codes and invitation links.
  - Member management with Owner, Editor, and Viewer permissions.
  - Built-in real-time team chat with system status events.
  - Collaborative room tasks/todo checklist.
- **Learning & Coding Challenges Hub**:
  - Interactive coding challenges categorized by difficulty (Easy, Medium, Hard) and topics.
  - Automated test runner for submission verification.
  - Global Leaderboard & Streak tracking to encourage daily learning.
- **Project Export & History**: Project state snapshots, Markdown export, and structured JSON download.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO, Prisma ORM, SQLite |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Real-Time Engine** | Socket.IO, custom Yjs state sync |
| **AI Integration** | Google Gemini API / OpenAI API integration with fallback intelligence |
| **Code Execution** | Isolated Node.js sandbox & Python execution worker |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= v18.0.0
- npm >= 9.0.0
- Python 3 (for running Python code snippets)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sky-ydv2008/code-apex.git
   cd code-apex
   ```

2. **Install Workspace Dependencies**
   ```bash
   npm run install:all
   ```

3. **Database Setup**
   ```bash
   cd server
   npx prisma db push
   npx prisma db seed
   cd ..
   ```

4. **Environment Configuration**
   - Create a `server/.env` file:
     ```env
     PORT=5000
     JWT_SECRET=codecraft_apex_innovators_super_secret_key_2026
     GEMINI_API_KEY=your_gemini_key_optional
     OPENAI_API_KEY=your_openai_key_optional
     ```

5. **Run the Application**
   ```bash
   # Run both Server (port 5000) and Client (port 5173) concurrently:
   npm start
   ```

---

## 📁 Repository Structure

```
code-apex/
├── client/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Editor, AI, Chat, Terminal, Tasks, Leaderboard)
│   │   ├── context/        # Auth and Room Socket State Providers
│   │   ├── pages/          # Landing, Auth, Dashboard, Room Workspace, Challenges
│   │   └── services/       # API and Socket HTTP/WS clients
├── server/                 # Node.js + Express + TypeScript Backend
│   ├── prisma/             # Prisma Schema and SQLite DB models
│   └── src/
│       ├── controllers/    # API Request Handlers
│       ├── services/       # AI Service, Code Execution Worker, Room Manager
│       ├── sockets/        # Socket.IO Real-time Events Handler
│       └── index.ts        # Express Server Entrypoint
└── README.md
```

---

## 🛡️ Security & Privacy
- Backend proxy for AI requests ensures API keys are **never** exposed to client browser bundles.
- Isolated process execution prevents user scripts from touching host file systems or persistent server state.
- Structured input sanitization on database operations via Prisma ORM.

---

Crafted with ❤️ by **Apex Innovators**
