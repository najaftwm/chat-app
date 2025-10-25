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
// API: Fetch assigned agent for a customer
require 'config.php';
header('Content-Type: application/json');

$customer_id = $_GET['customer_id'] ?? null;

if (!$customer_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing customer_id']);
    exit;
}

$stmt = $pdo->prepare("SELECT u.id, u.username FROM cust_agent_rel r JOIN users u ON r.agent_id = u.id WHERE r.customer_id = ? ORDER BY r.assigned_at DESC LIMIT 1");
$stmt->execute([$customer_id]);
$agent = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'agent' => $agent]);
