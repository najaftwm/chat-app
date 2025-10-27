<?php
// File: getMessages.php
// Purpose: Return all messages for a given customer_id (ordered ASC by created_at).
// Usage: GET ?customer_id=<int>
// Response: { status: "success", messages: [ ... ] }

require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$customer_id = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : null;
if (!$customer_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing customer_id']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, type, message, customer_id, agent_id, created_at FROM messages WHERE customer_id = ? ORDER BY created_at ASC");
    $stmt->execute([$customer_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'messages' => $messages]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch messages: ' . $e->getMessage()]);
}
