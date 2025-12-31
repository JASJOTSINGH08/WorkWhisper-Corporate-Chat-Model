package com.mycompany.chatchumcorporatebackendmodel;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ChatLogService {
    private static final String DB_URL = "jdbc:sqlite:chatchum.db";
    private static ChatLogService instance;
    private static final Gson gson = new Gson();

    private ChatLogService() {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            stmt.execute("CREATE TABLE IF NOT EXISTS chats (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "sender TEXT, " +
                        "receiver TEXT, " +
                        "message TEXT, " +
                        "timestamp TEXT)");
        } catch (SQLException e) {
            System.err.println("⚠️ ChatLogService: Failed to initialize database: " + e.getMessage());
        }
    }

    public static synchronized ChatLogService getInstance() {
        if (instance == null) {
            instance = new ChatLogService();
        }
        return instance;
    }

    public void logChat(String sender, String receiver, String message, String timestamp) {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            PreparedStatement pstmt = conn.prepareStatement(
                "INSERT INTO chats (sender, receiver, message, timestamp) VALUES (?, ?, ?, ?)");
            pstmt.setString(1, sender);
            pstmt.setString(2, receiver);
            pstmt.setString(3, message);
            pstmt.setString(4, timestamp);
            pstmt.executeUpdate();
            System.out.println("📝 ChatLogService: Logged chat between " + sender + " and " + receiver);
        } catch (SQLException e) {
            System.err.println("⚠️ ChatLogService: Failed to log chat: " + e.getMessage());
        }
    }

    public List<Map<String, String>> getChatHistory(String sender, String receiver) {
        List<Map<String, String>> chats = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            PreparedStatement pstmt = conn.prepareStatement(
                "SELECT sender, receiver, message, timestamp FROM chats WHERE " +
                "(sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)");
            pstmt.setString(1, sender);
            pstmt.setString(2, receiver);
            pstmt.setString(3, receiver);
            pstmt.setString(4, sender);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, String> chat = new HashMap<>();
                chat.put("from", rs.getString("sender"));
                chat.put("to", rs.getString("receiver"));
                chat.put("message", rs.getString("message"));
                chat.put("timestamp", rs.getString("timestamp"));
                chats.add(chat);
            }
        } catch (SQLException e) {
            System.err.println("⚠️ ChatLogService: Failed to load chat history: " + e.getMessage());
        }
        return chats;
    }
}