package com.mycompany.chatchumcorporatebackendmodel;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.mindrot.jbcrypt.BCrypt;
import spark.Spark;

import java.io.InputStream;
import java.lang.reflect.Type;
import java.sql.*;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class AuthServer {
    private static final String DB_URL = "jdbc:sqlite:chatchum.db";
    private static final Gson gson = new Gson();
    private static final UserService userService = UserService.getInstance();

    private static void initDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            stmt.execute("CREATE TABLE IF NOT EXISTS auth_users (" +
                    "email TEXT PRIMARY KEY, " +
                    "username TEXT UNIQUE, " +
                    "password TEXT)");
            stmt.execute("PRAGMA journal_mode=WAL;");
        } catch (SQLException e) {
            System.err.println("⚠️ AuthServer: Failed to initialize database: " + e.getMessage());
        }
    }

    public static void main(String[] args) throws Exception {
        initDatabase();

        // Firebase initialization
        InputStream serviceAccount = AuthServer.class.getClassLoader().getResourceAsStream("mychatapp-f92ae-firebase-adminsdk-fbsvc-0f95149a60.json");
        if (serviceAccount == null) {
            throw new IllegalStateException("Firebase service account file not found");
        }
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        FirebaseApp.initializeApp(options);
        System.out.println("🔥 Firebase Admin SDK initialized successfully.");

        // Set Spark port
        int port = Integer.parseInt(System.getenv().getOrDefault("AUTH_PORT", "8081"));
        Spark.port(port);

        // CORS
        Spark.before((request, response) -> {
            applyCorsHeaders(response);
        });

        Spark.options("/*", (request, response) -> {
          
            String requestHeaders = request.headers("Access-Control-Request-Headers");
            if (requestHeaders != null) {
                response.header("Access-Control-Allow-Headers", requestHeaders);
            }
            String requestMethod = request.headers("Access-Control-Request-Method");
            if (requestMethod != null) {
                response.header("Access-Control-Allow-Methods", requestMethod);
            }
            return "OK";
        });

        Type mapType = new TypeToken<Map<String, String>>(){}.getType();

        Spark.post("/signup", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), mapType);
            String email = body.get("email");
            String username = body.get("username");
            String password = body.get("password");

            if (email == null || username == null || password == null) {
                res.status(400);
                return gson.toJson(Map.of("error", "Email, username, and password are required"));
            }

            try (Connection conn = DriverManager.getConnection(DB_URL)) {
                PreparedStatement pstmt = conn.prepareStatement("SELECT 1 FROM auth_users WHERE email = ?");
                pstmt.setString(1, email);
                if (pstmt.executeQuery().next()) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Email already registered"));
                }

                if (userService.userExists(username)) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Username already taken"));
                }

                String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
                pstmt = conn.prepareStatement("INSERT INTO auth_users (email, username, password) VALUES (?, ?, ?)");
                pstmt.setString(1, email);
                pstmt.setString(2, username);
                pstmt.setString(3, hashedPassword);
                pstmt.executeUpdate();
                userService.addUser(username);

                res.status(200);
                return gson.toJson(Map.of("email", email, "username", username, "token", "mock-token-" + email));
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", "Server error: " + e.getMessage()));
            }
        });

        Spark.post("/login", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), mapType);
            String email = body.get("email");
            String password = body.get("password");

            if (email == null || password == null) {
                res.status(400);
                return gson.toJson(Map.of("error", "Email and password are required"));
            }

            try (Connection conn = DriverManager.getConnection(DB_URL)) {
                PreparedStatement pstmt = conn.prepareStatement("SELECT username, password FROM auth_users WHERE email = ?");
                pstmt.setString(1, email);
                ResultSet rs = pstmt.executeQuery();
                if (!rs.next()) {
                    res.status(401);
                    return gson.toJson(Map.of("error", "Invalid email or password"));
                }
                String storedPassword = rs.getString("password");
                String username = rs.getString("username");
                if (!BCrypt.checkpw(password, storedPassword)) {
                    res.status(401);
                    return gson.toJson(Map.of("error", "Invalid email or password"));
                }

                res.status(200);
                return gson.toJson(Map.of("email", email, "username", username, "token", "mock-token-" + email));
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", "Server error: " + e.getMessage()));
            }
        });

        Spark.post("/google-login", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), mapType);
            String idToken = body.get("token");

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdTokenAsync(idToken).get();
                String email = decodedToken.getEmail();

                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement pstmt = conn.prepareStatement("SELECT username FROM auth_users WHERE email = ?");
                    pstmt.setString(1, email);
                    ResultSet rs = pstmt.executeQuery();
                    String username = rs.next() ? rs.getString("username") : null;

                    if (username == null) {
                        pstmt = conn.prepareStatement("INSERT INTO auth_users (email, username, password) VALUES (?, ?, ?)");
                        pstmt.setString(1, email);
                        pstmt.setString(2, email); // Temporary username
                        pstmt.setString(3, "");
                        pstmt.executeUpdate();
                        username = email; // Use email as temporary username
                    }

                    res.status(200);
                    return gson.toJson(Map.of("email", email, "username", username, "token", idToken));
                }
            } catch (InterruptedException | ExecutionException e) {
                res.status(401);
                return gson.toJson(Map.of("error", "Invalid token: " + e.getMessage()));
            }
        });

        Spark.post("/set-username", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), mapType);
            String email = body.get("email");
            String username = body.get("username");

            if (email == null || username == null) {
                res.status(400);
                return gson.toJson(Map.of("error", "Email and username are required"));
            }

            try (Connection conn = DriverManager.getConnection(DB_URL)) {
                PreparedStatement pstmt = conn.prepareStatement("SELECT 1 FROM auth_users WHERE email = ?");
                pstmt.setString(1, email);
                if (!pstmt.executeQuery().next()) {
                    res.status(404);
                    return gson.toJson(Map.of("error", "User not found"));
                }

                if (userService.userExists(username)) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Username already taken"));
                }

                pstmt = conn.prepareStatement("UPDATE auth_users SET username = ? WHERE email = ?");
                pstmt.setString(1, username);
                pstmt.setString(2, email);
                pstmt.executeUpdate();
                userService.addUser(username);

                res.status(200);
                return gson.toJson(Map.of("email", email, "username", username));
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", "Server error: " + e.getMessage()));
            }
        });

        Spark.post("/verify-session", (req, res) -> {
            res.type("application/json");
            String authHeader = req.headers("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                res.status(401);
                return gson.toJson(Map.of("error", "Missing or invalid Authorization header"));
            }

            String token = authHeader.substring("Bearer ".length());

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdTokenAsync(token).get();
                String email = decodedToken.getEmail();

                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement pstmt = conn.prepareStatement("SELECT username FROM auth_users WHERE email = ?");
                    pstmt.setString(1, email);
                    ResultSet rs = pstmt.executeQuery();

                    if (rs.next()) {
                        String username = rs.getString("username");
                        return gson.toJson(Map.of("email", email, "username", username));
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "User not found"));
                    }
                }
            } catch (InterruptedException | ExecutionException e) {
                res.status(401);
                return gson.toJson(Map.of("error", "Invalid token: " + e.getMessage()));
            }
        });

        Spark.init();
        System.out.println("🚀 HTTP Auth Server started on port " + port);
    }

    private static void applyCorsHeaders(spark.Response response) {
    String allowedOrigin = System.getenv().getOrDefault("CORS_ORIGIN", "http://localhost:3000");

    if (response.raw().getHeader("Access-Control-Allow-Origin") == null) {
        response.header("Access-Control-Allow-Origin", allowedOrigin);
    }

    if (response.raw().getHeader("Access-Control-Allow-Credentials") == null) {
        response.header("Access-Control-Allow-Credentials", "true");
    }
   }
}
