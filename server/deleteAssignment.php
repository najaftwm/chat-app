<?php
// File: deleteAssignment.php
// Purpose: Delete a cust_agent_rel row by id.
// Usage: POST JSON { "id": <int> } OR GET ?id=<int>
// Response: { status: "success", message: "Deleted", id: <int> }

require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$id = null;
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
} else {
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing id']);
    exit;
}

try {
    // Optionally return the deleted row for confirmation
    $stmt = $pdo->prepare("SELECT * FROM cust_agent_rel WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Assignment not found']);
        exit;
    }

    $stmtDel = $pdo->prepare("DELETE FROM cust_agent_rel WHERE id = ?");
    $stmtDel->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => "Deleted assignment id {$id}", 'deleted' => $row]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Delete failed: ' . $e->getMessage()]);
}
