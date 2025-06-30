package com.mycompany.chatchumcorporatebackendmodel;

import java.sql.*;
import java.util.HashSet;
import java.util.Set;

public class UserService {
    private static final String DB_URL = "jdbc:sqlite:chatchum.db";
    private static UserService instance;

    private UserService() {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            stmt.execute("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY)");
        } catch (SQLException e) {
            System.err.println("⚠️ UserService: Failed to initialize database: " + e.getMessage());
        }
    }

    public static synchronized UserService getInstance() {
        if (instance == null) {
            instance = new UserService();
        }
        return instance;
    }

    public synchronized boolean addUser(String username) {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            PreparedStatement pstmt = conn.prepareStatement("INSERT OR IGNORE INTO users (username) VALUES (?)");
            pstmt.setString(1, username);
            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("⚠️ UserService: Failed to add user: " + e.getMessage());
            return false;
        }
    }

    public synchronized Set<String> getRegisteredUsers() {
        Set<String> users = new HashSet<>();
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT username FROM users");
            while (rs.next()) {
                users.add(rs.getString("username"));
            }
        } catch (SQLException e) {
            System.err.println("⚠️ UserService: Failed to load users: " + e.getMessage());
        }
        return users;
    }

    public synchronized boolean userExists(String username) {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            PreparedStatement pstmt = conn.prepareStatement("SELECT 1 FROM users WHERE username = ?");
            pstmt.setString(1, username);
            return pstmt.executeQuery().next();
        } catch (SQLException e) {
            System.err.println("⚠️ UserService: Failed to check user: " + e.getMessage());
            return false;
        }
    }
}