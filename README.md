<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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

>>>>>>> 957caf246e23625cc272414809a786eb5d1f8028
