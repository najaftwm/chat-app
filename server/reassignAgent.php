<?php
// File: reassignAgent.php
// Purpose: Assign or reassign an agent to a customer. Ensures exactly one row per customer using UNIQUE index.
// Usage: POST JSON { "customer_id": int, "agent_id": int }
// Response JSON: { status: "success", action: "assigned"|"reassigned", assignment_id: <int>, message: "..." }

require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$customer_id = isset($input['customer_id']) ? (int)$input['customer_id'] : null;
$agent_id = isset($input['agent_id']) ? (int)$input['agent_id'] : null;

if (!$customer_id || !$agent_id) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing customer_id or agent_id'
    ]);
    exit;
}

try {
    // Use INSERT ... ON DUPLICATE KEY UPDATE — requires unique index on customer_id (see SQL above).
    $sql = "INSERT INTO cust_agent_rel (customer_id, agent_id, assigned_at)
            VALUES (:customer_id, :agent_id, NOW())
            ON DUPLICATE KEY UPDATE
              agent_id = VALUES(agent_id),
              assigned_at = NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':customer_id' => $customer_id,
        ':agent_id' => $agent_id
    ]);

    // Get the assignment id: if a new row was inserted, lastInsertId() returns it.
    // If it was an update, we need to fetch the existing id.
    $lastId = (int)$pdo->lastInsertId();
    if ($lastId === 0) {
        // updated existing row — fetch its id
        $stmt2 = $pdo->prepare("SELECT id FROM cust_agent_rel WHERE customer_id = ? LIMIT 1");
        $stmt2->execute([$customer_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $assignment_id = $row ? (int)$row['id'] : null;
        $action = 'reassigned';
    } else {
        $assignment_id = $lastId;
        $action = 'assigned';
    }

    // Optionally: trigger an event to notify agent or admin UI (not required).
    echo json_encode([
        'status' => 'success',
        'action' => $action,
        'assignment_id' => $assignment_id,
        'message' => ucfirst($action) . " agent {$agent_id} to customer {$customer_id}"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'DB error: ' . $e->getMessage()
    ]);
}
