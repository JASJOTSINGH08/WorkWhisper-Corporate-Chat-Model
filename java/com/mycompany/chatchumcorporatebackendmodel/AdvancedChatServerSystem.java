//package com.mycompany.chatchumcorporatebackendmodel;
//
//import java.net.ServerSocket;
//import java.net.Socket;
//import java.util.ArrayList;
//import java.util.HashMap;
//
//public class AdvancedChatServerSystem {
//    private final ArrayList<ServerThreaded> threadList;
//    private final HashMap<String, ServerThreaded> clientMap;
//    private final int port;
//
//    public AdvancedChatServerSystem() {
//        this.port = Integer.parseInt(System.getenv().getOrDefault("TCP_PORT", "7454"));
//        threadList = new ArrayList<>();
//        clientMap = new HashMap<>();
//    }
//
//    public HashMap<String, ServerThreaded> getClientMap() {
//        return clientMap;
//    }
//
//    public void start() {
//        try (ServerSocket serverSocket = new ServerSocket(port)) {
//            System.out.println("🚀 TCP Chat Server started on port " + port);
//            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
//                try {
//                    serverSocket.close();
//                    synchronized (clientMap) {
//                        for (ServerThreaded thread : threadList) {
//                            thread.interrupt();
//                        }
//                    }
//                    System.out.println("🛑 TCP Server stopped");
//                } catch (Exception e) {
//                    System.err.println("❌ Error stopping TCP server: " + e.getMessage());
//                }
//            }));
//            while (!serverSocket.isClosed()) {
//                Socket socket = serverSocket.accept();
//                System.out.println("🔗 New connection from " + socket.getRemoteSocketAddress());
//                ServerThreaded serverThread = new ServerThreaded(socket, this, threadList, clientMap);
//                threadList.add(serverThread);
//                serverThread.start();
//            }
//        } catch (Exception e) {
//            System.err.println("❌ Error in TCP server: " + e.getMessage());
//            e.printStackTrace();
//        }
//    }
//
//    public static void main(String[] args) {
//        new AdvancedChatServerSystem().start();
//    }
//}