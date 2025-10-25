<?php
// ✅ CORS fix for local React frontend (Vite)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// API: Fetch chat history between customer and agent
require 'config.php';
header('Content-Type: application/json');

$customer_id = $_GET['customer_id'] ?? null;

if (!$customer_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing customer_id']);
    exit;
}

// Fetch messages
$stmt = $pdo->prepare("SELECT * FROM messages WHERE customer_id = ? ORDER BY created_at ASC");
$stmt->execute([$customer_id]);
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'messages' => $messages]);
