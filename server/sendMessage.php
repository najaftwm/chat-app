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
// API: Send message (customer → agent)
require 'config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$customer_id = $data['customer_id'] ?? null;
$agent_id =$data['agent_id'] ?? null;
$message = $data['message'] ?? null;


if(!$message){
    echo json_encode(['status' => 'error', 'message' => 'message text is requied']);
    exit;
}

if (!$customer_id && !$agent_id) {
    echo json_encode(['status' => 'error', 'message' => 'Either customer_id or agent_id required']);
    exit;
}

// Case 1: Customer sends message
if ($customer_id && !$agent_id) {
    // Fetch the assigned agent
    $stmt = $pdo->prepare("SELECT agent_id FROM cust_agent_rel WHERE customer_id = ? ORDER BY assigned_at DESC LIMIT 1");
    $stmt->execute([$customer_id]);
    $agent = $stmt->fetch(PDO::FETCH_ASSOC);
    $agent_id = $agent['agent_id'] ?? null;
    $type = 'incoming';
}
// Case 2: Agent sends message
else if ($agent_id && $customer_id) {
    $type = 'outgoing';
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing customer_id for agent message']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO messages (type, message, customer_id, agent_id) VALUES (?, ?, ?, ?)");
$stmt->execute([$type, $message, $customer_id, $agent_id]);

// Get the inserted message ID
$message_id = $pdo->lastInsertId();

// Trigger Pusher event
$pusher->trigger("chat_channel_{$customer_id}", 'new_message', [
    'id' => $message_id,
    'type' => $type,
    'message' => $message,
    'customer_id' => $customer_id,
    'agent_id' => $agent_id,
    'created_at' => date('Y-m-d H:i:s')
]);

echo json_encode([
    'status' => 'success',
    'type' => $type,
    'message' => 'Message sent successfully'
]);

// Fetch assigned agent
// $stmt = $pdo->prepare("SELECT agent_id FROM cust_agent_rel WHERE customer_id = ? ORDER BY assigned_at DESC LIMIT 1");
// $stmt->execute([$customer_id]);
// $agent = $stmt->fetch(PDO::FETCH_ASSOC);

// $agent_id = $agent['agent_id'] ?? null;

// // Insert message into DB
// $stmt = $pdo->prepare("INSERT INTO messages (type, message, customer_id, agent_id) VALUES (?, ?, ?, ?)");
// $stmt->execute(['incoming', $message, $customer_id, $agent_id]);

// // Trigger Pusher event
// $pusher->trigger("chat_channel_{$customer_id}", 'new_message', [
//     'type' => 'incoming',
//     'message' => $message,
//     'customer_id' => $customer_id,
//     'agent_id' => $agent_id,
//     'created_at' => date('Y-m-d H:i:s')
// ]);

// echo json_encode(['status' => 'success', 'agent_id' => $agent_id]);
