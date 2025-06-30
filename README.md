# WorkWhisper-Corporate-Chat-Model
WorkWhisper is a modern, lightweight corporate messaging platform designed for seamless real-time communication, intelligent message delivery, and secure user authentication. It supports encrypted messaging, chat history persistence (JSON + SQLite), and Firebase-based user verification.

🚀 Features
🔐 Secure Login (Email/Password + Google OAuth)
🔄 Real-time Messaging via WebSockets
💾 Chat History Sync (JSON & SQLite-backed)
🧠 Smart Retry & Encryption for failed messages
🔎 Search Messages by Query or Date
👤 Active User List Broadcast
🌙 Dark Mode + Intuitive UI (React)

🧱 Tech Stack
Frontend	Backend	Storage
React (Socket + Auth)	Java WebSocket Server (8080)	JSON Chat Logs
Context API	Spark Java Auth API (8081)	SQLite (User & Chats)
Firebase SDK (Google)	Gson + Java I/O	Local FileSystem

📁 Project Structure
bash
Copy
Edit
/frontend/
  ├── src/
  │   ├── components/
  │   ├── context/SocketProvider.js
  │   └── AuthProvider.js
/backend/
  ├── ChatWebSocketServer.java
  ├── AuthServer.java
  ├── ChatLogService.java
  └── UserService.java
/chatlogs/
  └── [username]/sender_receiver.json
chatchum.db         ← SQLite DB for auth & chat
active_clients.txt  ← List of online users

⚙️ Getting Started
🔧 Prerequisites
- Java 11+
- Node.js + npm
- SQLite (pre-installed)
- Firebase Admin SDK JSON file (for Auth)

🔌 Backend
bash
Copy
Edit
cd backend
javac *.java
java com.mycompany.chatchumcorporatebackendmodel.AuthServer
java com.mycompany.chatchumcorporatebackendmodel.ChatWebSocketServer

💻 Frontend
bash
Copy
Edit
cd frontend
npm install
npm start

🧠 Chat History Storage
All chat messages are stored in two formats:

📁 JSON: chatlogs/[sender]/sender_receiver.json
🗃️ SQLite DB: chatchum.db (chats table)

This enables flexibility — file-based recovery + database indexing.

🔒 Security
- AES-like XOR encryption on messages (for demo)
- Bcrypt password hashing for user data
- Firebase Token validation for Google login
- Auto-reconnect, message retry, and session check

📌 To Do
 - Group chat support
 - File sharing (images/docs)
 - Admin dashboard for moderation
 - Deployment on Firebase / Vercel / Heroku

