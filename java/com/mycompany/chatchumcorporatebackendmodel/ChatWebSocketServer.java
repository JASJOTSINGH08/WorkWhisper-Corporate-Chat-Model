package com.mycompany.chatchumcorporatebackendmodel;

import java.io.*;
import java.util.*;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import com.google.gson.Gson;

public class ChatWebSocketServer extends WebSocketServer {
    private static final Map<String, WebSocket> usernameToSocket = new HashMap<>();
    private static final String CLIENTS_FILE = "active_clients.txt";
    private static final String CHATLOGS_DIR = "chatlogs";
    private static final Gson gson = new Gson();
    private static final int PORT = 8080;

    public ChatWebSocketServer() {
        super(new java.net.InetSocketAddress(PORT));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        String origin = handshake.getFieldValue("Origin");

        System.out.println("🌐 WebSocket connection attempt from origin: " + origin);

        // Only allow known safe frontend
        if (origin != null && !origin.equals("http://localhost:3000")) {
            System.out.println("❌ Blocked connection from disallowed origin: " + origin);
            conn.close(); // Close if origin not allowed
            return;
        }

        System.out.println("✅ WebSocket connected. Total clients: " + getConnections().size());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        String username = getUsername(conn);
        if (username != null) {
            usernameToSocket.remove(username);
            updateActiveClients();
            broadcastClientList();
        }
        System.out.println("🔌 Client disconnected. Reason: " + reason);
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        try {
            Map<String, String> data = gson.fromJson(message, Map.class);
            String type = data.get("type");
            
            if ("ping".equals(type)) {
                conn.send("{\"type\":\"pong\"}");
            }
            String username = getUsername(conn);

            if ("init".equals(type)) {
                String initUsername = data.get("username");
                if (initUsername != null && !usernameToSocket.containsKey(initUsername)) {
                    usernameToSocket.put(initUsername, conn);
                    System.out.println("👥 Added user: " + initUsername + ", Total users: " + usernameToSocket.size());
                    updateActiveClients();
                    broadcastClientList();
                    sendChatHistory(initUsername); // Send history to new user
                }
            } else if ("message".equals(type)) {
                String sender = data.get("sender");
                String receiver = data.get("receiver");
                String content = data.get("content");
                if (sender != null && receiver != null && content != null) {
                    WebSocket receiverConn = usernameToSocket.get(receiver);
                    if (receiverConn != null && receiverConn.isOpen()) {
                        receiverConn.send(message); // Send to receiver
                        conn.send(message); // Echo to sender
                        saveChatMessage(sender, receiver, content); // Use sender from JSON
                        sendChatHistory(sender, receiver); // Update sender's history
                        sendChatHistory(receiver, sender); // Update receiver's history
                    } else {
                        System.out.println("⚠️ Receiver " + receiver + " not found or not open");
                    }
                } else {
                    System.out.println("⚠️ Invalid sender or receiver or content");
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Message processing error: " + e.getMessage());
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        System.err.println("⚠️ WebSocket error: " + ex.getMessage());
    }

    @Override
    public void onStart() {
        System.out.println("🚀 WebSocket Chat Server started on port " + PORT);
    }

    private String getUsername(WebSocket conn) {
        for (Map.Entry<String, WebSocket> entry : usernameToSocket.entrySet()) {
            if (entry.getValue().equals(conn)) {
                return entry.getKey();
            }
        }
        return null;
    }

    private void updateActiveClients() {
        System.out.println("👥 Updating active clients: " + usernameToSocket.keySet());
        try (PrintWriter writer = new PrintWriter(new FileWriter(CLIENTS_FILE))) {
            usernameToSocket.keySet().forEach(writer::println);
        } catch (IOException e) {
            System.err.println("⚠️ Failed to update active_clients.txt: " + e.getMessage());
        }
    }

    private void broadcastClientList() {
        String clientsJson = gson.toJson(new ArrayList<>(usernameToSocket.keySet()));
        for (WebSocket conn : getConnections()) {
            if (conn.isOpen()) {
                conn.send("{\"type\":\"clientList\",\"clients\":" + clientsJson + "}");
            }
        }
    }

    private void saveChatMessage(String sender, String receiver, String content) {
        try {
            File dir = new File(CHATLOGS_DIR);
            if (!dir.exists()) dir.mkdir();
            File userDir = new File(CHATLOGS_DIR + "/" + sender);
            if (!userDir.exists()) userDir.mkdir();
            String fileName = CHATLOGS_DIR + "/" + sender + "/" + sender + "_" + receiver + ".json";
            Map<String, Object> chat = new HashMap<>();
            chat.put("sender", sender);
            chat.put("receiver", receiver);
            chat.put("content", content);
            chat.put("timestamp", new java.util.Date().toString());
            try (FileWriter writer = new FileWriter(fileName, true)) {
                writer.write(gson.toJson(chat) + "\n");
            }
        } catch (IOException e) {
            System.err.println("⚠️ Failed to save chat message: " + e.getMessage());
        }
    }

    private void sendChatHistory(String username) {
        for (String otherUser : usernameToSocket.keySet()) {
            if (!otherUser.equals(username)) {
                sendChatHistory(username, otherUser);
            }
        }
    }

    private void sendChatHistory(String username, String otherUser) {
        String fileName = CHATLOGS_DIR + "/" + username + "/" + username + "_" + otherUser + ".json";
        List<Map<String, Object>> history = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(fileName))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Map<String, Object> chat = gson.fromJson(line, Map.class);
                history.add(chat);
            }
        } catch (IOException e) {
            // File might not exist yet
        }
        WebSocket conn = usernameToSocket.get(username);
        if (conn != null && conn.isOpen()) {
            conn.send("{\"type\":\"chatHistory\",\"receiver\":\"" + otherUser + "\",\"history\":" + gson.toJson(history) + "}");
        }
    }

    public static void main(String[] args) {
        ChatWebSocketServer server = new ChatWebSocketServer();
        try {
            server.start();
            System.out.println("🚀 Server running. Press Enter to stop.");
            System.in.read();
            server.stop();
        } catch (Exception e) {
            System.err.println("⚠️ Server failed to start: " + e.getMessage());
        }
    }
}