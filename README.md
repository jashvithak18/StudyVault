# StudyVault 📚🧪

StudyVault is a state-of-the-art Collaborative Academic Platform designed for modern students. It features secure JWT authentication, document note uploads with automated summaries, semantic-style contextual Q&A, and a real-time collaborative canvas whiteboard.

## Platform Features
1. **Premium Dashboard**: Real-time stats widgets and active room panels.
2. **Notes Repository**: Document upload and viewing with automatic AI-powered summarizing.
3. **AskVault AI Assistant**: Semantic search chat contextually querying note databases.
4. **Interactive doubt forum**: Create questions, write markdown answers, upvote/downvote content.
5. **Real-time Whiteboard**: Dynamic Socket.io room synchronization to co-sketch ideas with peers.

---

## Directory Layout

```
study-vault/
├── frontend/        # React + Vite frontend styled with a premium light theme
└── backend/         # Node + Express + Mongoose + Socket.io collaborative backend
```

## Quick Start Setup

1. **Configure Environment variables**
   Create a `backend/.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/studyvault
   JWT_SECRET=yoursupersecurejwtsecretkeyhere
   ```

2. **Install all packages**
   Navigate to the `backend/` and `frontend/` folders and run:
   ```bash
   npm install
   ```

3. **Launch the MERN Platform in Development mode**
   - **Backend**: Run `nodemon server` inside the `backend/` folder.
   - **Frontend**: Run `npm run dev` inside the `frontend/` folder.
   This starts the backend server on `http://localhost:5000` and the React frontend on `http://localhost:5173`.
