<?php
// API: Manually assign an agent to a customer
require 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$customer_id = $data['customer_id'] ?? null;
$agent_id = $data['agent_id'] ?? null;

if (!$customer_id || !$agent_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    exit;
}
try{
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND user_type = 'Agent'");
    $stmt->execute([$agent_id]);

    if (!$stmt->fetch()) {
        throw new Exception("Agent ID $agent_id does not exist or is not an Agent.");
    }
// Insert into cust_agent_rel
$stmt = $pdo->prepare("INSERT INTO cust_agent_rel (customer_id, agent_id) VALUES (?, ?)");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$stmt->execute([$customer_id, $agent_id]);

echo json_encode(['status' => 'success', 'message' => "Agent $agent_id assigned to Customer $customer_id"]);
} catch (Exception $e)
{
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);

}