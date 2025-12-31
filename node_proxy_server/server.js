// const net = require('net');
// const socketIO = require('socket.io');
// const http = require('http');

// // Create HTTP server for Socket.IO
// const server = http.createServer();
// const io = socketIO(server);

// // TCP server to connect with your Java backend
// const TCP_PORT = 7454; // Your Java server's TCP port
// const tcpClient = new net.Socket();

// tcpClient.connect(TCP_PORT, '127.0.0.1', () => {
//     console.log('Connected to Java server');
// });

// tcpClient.on('data', (data) => {
//     console.log('Received from Java server:', data.toString());
//     // Broadcast data to all connected WebSocket clients
//     io.emit('message', data.toString());
// });

// tcpClient.on('error', (err) => {
//     console.error('TCP connection error:', err);
// });

// // Set up WebSocket connection (via Socket.IO)
// io.on('connection', (socket) => {
//     console.log('Client connected');

//     // Listen for messages from the React client
//     socket.on('message', (message) => {
//         console.log('Received message from client:', message);
//         // Send message to the Java backend
//         tcpClient.write(message);
//     });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// // Start HTTP server for WebSocket communication
// server.listen(3000, () => {
//     console.log('WebSocket server running on port 3000');
// });
