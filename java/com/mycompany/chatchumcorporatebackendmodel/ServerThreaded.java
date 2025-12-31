//package com.mycompany.chatchumcorporatebackendmodel;
//
//import com.google.gson.Gson;
//import com.google.gson.JsonObject;
//import com.google.gson.JsonParser;
//
//import java.io.*;
//import java.net.Socket;
//import java.net.SocketTimeoutException;
//import java.time.Instant;
//import java.util.ArrayList;
//import java.util.HashMap;
//
//public class ServerThreaded extends Thread {
//    private static final int TIMEOUT = 220000;
//    private final Socket socket;
//    private final AdvancedChatServerSystem server;
//    private final HashMap<String, ServerThreaded> clientMap;
//    private final ArrayList<ServerThreaded> threadList;
//    private String clientName;
//    private PrintWriter output;
//    private BufferedReader input;
//    private final Gson gson = new Gson();
//    private final UserService userService = UserService.getInstance();
//    private final ChatLogService chatLogService = ChatLogService.getInstance();
//
//    public ServerThreaded(Socket socket, AdvancedChatServerSystem server, ArrayList<ServerThreaded> threadList, HashMap<String, ServerThreaded> clientMap) {
//        this.socket = socket;
//        this.server = server;
//        this.threadList = threadList;
//        this.clientMap = clientMap;
//        try {
//            this.socket.setSoTimeout(TIMEOUT);
//        } catch (IOException e) {
//            System.err.println("❌ Error setting socket timeout: " + e.getMessage());
//        }
//    }
//
//    @Override
//    public void run() {
//        try {
//            input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
//            output = new PrintWriter(socket.getOutputStream(), true);
//
//            // Register client
//            String initMessage = input.readLine();
//            JsonObject initJson = JsonParser.parseString(initMessage).getAsJsonObject();
//            if (!initJson.has("type") || !initJson.get("type").getAsString().equals("init") || !initJson.has("username")) {
//                sendError("Invalid init message");
//                return;
//            }
//            clientName = initJson.get("username").getAsString().trim();
//            if (clientName.isEmpty()) {
//                sendError("Username cannot be empty");
//                return;
//            }
//
//            synchronized (clientMap) {
//                if (clientMap.containsKey(clientName) || userService.userExists(clientName)) {
//                    sendError("Username '" + clientName + "' is already in use");
//                    return;
//                }
//                clientMap.put(clientName, this);
//                userService.addUser(clientName);
//            }
//
//            output.println(gson.toJson(new HashMap<String, String>() {{
//                put("type", "registered");
//                put("username", clientName);
//            }}));
//            printActiveClients();
//            broadcastUserList();
//
//            String inputLine;
//            while ((inputLine = input.readLine()) != null) {
//                JsonObject json = JsonParser.parseString(inputLine).getAsJsonObject();
//                String type = json.has("type") ? json.get("type").getAsString() : "";
//
//                switch (type) {
//                    case "message":
//                        if (!json.has("receiver") || !json.has("content")) {
//                            sendError("Invalid message format");
//                            continue;
//                        }
//                        String receiver = json.get("receiver").getAsString().trim();
//                        String content = json.get("content").getAsString().trim();
//                        sendToClient(receiver, content);
//                        break;
//                    case "getUsers":
//                        output.println(gson.toJson(new HashMap<String, String>() {{
//                            put("type", "userlist");
//                            put("users", String.join(",", userService.getRegisteredUsers()));
//                        }}));
//                        break;
//                    case "history":
//                        if (!json.has("receiver")) {
//                            sendError("Invalid history request");
//                            continue;
//                        }
//                        String to = json.get("receiver").getAsString().trim();
//                        output.println(gson.toJson(new HashMap<String, Object>() {{
//                            put("type", "history");
//                            put("messages", chatLogService.getChatHistory(clientName, to));
//                        }}));
//                        break;
//                    default:
//                        sendError("Unknown command");
//                }
//            }
//        } catch (SocketTimeoutException e) {
//            System.out.println("⏳ Client '" + clientName + "' timed out.");
//            notifyClientTimeout();
//        } catch (Exception e) {
//            System.err.println("❌ Error handling client " + clientName + ": " + e.getMessage());
//        } finally {
//            try {
//                socket.close();
//                synchronized (clientMap) {
//                    clientMap.remove(clientName);
//                    broadcastUserList();
//                }
//            } catch (IOException e) {
//                System.err.println("❌ Error closing socket for client " + clientName + ": " + e.getMessage());
//            }
//        }
//    }
//
//    private void sendToClient(String targetClientName, String message) {
//        ServerThreaded targetClient;
//        synchronized (clientMap) {
//            targetClient = clientMap.get(targetClientName);
//        }
//
//        String timestamp = Instant.now().toString();
//        if (targetClient != null) {
//            targetClient.output.println(gson.toJson(new HashMap<String, String>() {{
//                put("type", "message");
//                put("from", clientName);
//                put("to", targetClientName);
//                put("content", message);
//                put("timestamp", timestamp);
//            }}));
//            chatLogService.logChat(clientName, targetClientName, message, timestamp);
//            output.println(gson.toJson(new HashMap<String, String>() {{
//                put("type", "sent");
//                put("to", targetClientName);
//                put("content", message);
//            }}));
//        } else {
//            sendError("User '" + targetClientName + "' not found");
//        }
//    }
//
//    private void sendError(String message) {
//        output.println(gson.toJson(new HashMap<String, String>() {{
//            put("type", "error");
//            put("message", message);
//        }}));
//    }
//
//    private void notifyClientTimeout() {
//        output.println(gson.toJson(new HashMap<String, String>() {{
//            put("type", "error");
//            put("message", "Timed out due to inactivity");
//        }}));
//        output.flush();
//    }
//
//    private void printActiveClients() {
//        synchronized (clientMap) {
//            System.out.println("👥 TCP Server: Current Clients:");
//            for (String client : clientMap.keySet()) {
//                System.out.println("(" + client + ", online)");
//            }
//            System.out.println("---");
//        }
//    }
//
//    private void broadcastUserList() {
//        String users = String.join(",", userService.getRegisteredUsers());
//        synchronized (clientMap) {
//            for (ServerThreaded client : clientMap.values()) {
//                client.output.println(gson.toJson(new HashMap<String, String>() {{
//                    put("type", "userlist");
//                    put("users", users);
//                }}));
//            }
//        }
//    }
//}