<?php
// File: getAgents.php
// Purpose: Return all users with user_type = 'Agent'.
// Usage: GET -> returns JSON { status: "success", agents: [ ... ] }

// Load DB + Pusher config
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE user_type = 'Agent' ORDER BY username ASC");
    $stmt->execute();
    $agents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'agents' => $agents
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch agents: ' . $e->getMessage()
    ]);
}

