<?php
// File: getAssignedAgent.php
// Purpose: Return the currently assigned agent for a given customer_id (if any).
// Usage: GET ?customer_id=<int>
// Response: { status: "success", agent: { id, username } } OR agent: null

require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$customer_id = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : null;
if (!$customer_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing customer_id']);
    exit;
}

try {
    // Join with users to return agent info (id and username)
    $stmt = $pdo->prepare("SELECT u.id, u.username
                           FROM cust_agent_rel r
                           JOIN users u ON r.agent_id = u.id
                           WHERE r.customer_id = ?
                           ORDER BY r.assigned_at DESC
                           LIMIT 1");
    $stmt->execute([$customer_id]);
    $agent = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($agent) {
        echo json_encode(['status' => 'success', 'agent' => $agent]);
    } else {
        echo json_encode(['status' => 'success', 'agent' => null]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
}
