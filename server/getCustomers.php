<?php
// File: getCustomers.php
// Purpose: Return all customers from the users table where user_type = 'Customer'.
// Usage: GET -> returns JSON { status: "success", customers: [ ... ] }

// Load DB + Pusher config
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

try {
    // First, try to check if a separate customers table exists
    $tablesCheck = $pdo->query("SHOW TABLES LIKE 'customers'");
    $customersTableExists = $tablesCheck->rowCount() > 0;
    
    if ($customersTableExists) {
        // Use the customers table if it exists (customers table uses 'name' column)
        $stmt = $pdo->prepare("
            SELECT 
                c.id, 
                c.name as username,
                r.agent_id,
                r.assigned_at
            FROM customers c
            LEFT JOIN cust_agent_rel r ON c.id = r.customer_id
            ORDER BY c.id ASC
        ");
    } else {
        // Otherwise, use users table with case-insensitive check
        $stmt = $pdo->prepare("
            SELECT 
                u.id, 
                u.username, 
                u.created_at,
                r.agent_id,
                r.assigned_at
            FROM users u
            LEFT JOIN cust_agent_rel r ON u.id = r.customer_id
            WHERE LOWER(u.user_type) = 'customer'
            ORDER BY u.created_at DESC
        ");
    }
    
    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'customers' => $customers,
        'count' => count($customers)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch customers: ' . $e->getMessage()
    ]);
}

