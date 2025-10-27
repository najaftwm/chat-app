<?php
// File: getAssignments.php
// Purpose: Return all rows from cust_agent_rel table (id, customer_id, agent_id, assigned_at).
// Usage: GET -> returns JSON { status: "success", assignments: [ ... ] }

// Load DB + Pusher config
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

try {
    // Join with users table to get agent information
    $stmt = $pdo->prepare("
        SELECT 
            r.id, 
            r.customer_id, 
            r.agent_id, 
            r.assigned_at,
            u.username as agent_username
        FROM cust_agent_rel r
        LEFT JOIN users u ON r.agent_id = u.id
        ORDER BY r.assigned_at DESC
    ");
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'assignments' => $assignments
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch assignments: ' . $e->getMessage()
    ]);
}
