<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Username and password are required'
        ]);
        exit;
    }
    
    $username = trim($data['username']);
    $password = trim($data['password']);
    
    // Query the users table
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid username or password'
        ]);
        exit;
    }
    
    // Verify password
    // If passwords are stored as plain text (not recommended but checking both)
    if ($user['password'] === $password) {
        // Plain text password match
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'] ?? 'admin'
            ]
        ]);
    } elseif (password_verify($password, $user['password'])) {
        // Hashed password match
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'] ?? 'admin'
            ]
        ]);
    } else {
        // Password doesn't match
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid username or password'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

