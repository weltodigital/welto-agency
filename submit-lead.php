<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'welto_leads',
    'username' => 'root',
    'password' => ''
];

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Create database connection
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Validate required fields
    $required_fields = ['first_name', 'last_name', 'email', 'phone', 'business_name', 'trade_type', 'location', 'current_marketing'];
    $missing_fields = [];

    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields: ' . implode(', ', $missing_fields)
        ]);
        exit;
    }

    // Sanitize and validate email
    $email = filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL);
    if (!$email) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit;
    }

    // Sanitize input data
    $data = [
        'first_name' => trim($_POST['first_name']),
        'last_name' => trim($_POST['last_name']),
        'email' => $email,
        'phone' => trim($_POST['phone']),
        'business_name' => trim($_POST['business_name']),
        'trade_type' => trim($_POST['trade_type']),
        'location' => trim($_POST['location']),
        'current_marketing' => trim($_POST['current_marketing']),
        'message' => trim($_POST['message'] ?? ''),
        'source' => 'seo-leads-1',
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'submitted_at' => date('Y-m-d H:i:s')
    ];

    // Check for duplicate email (optional - remove if you want to allow duplicates)
    $check_stmt = $pdo->prepare("SELECT id FROM leads WHERE email = ? ORDER BY submitted_at DESC LIMIT 1");
    $check_stmt->execute([$data['email']]);
    $existing_lead = $check_stmt->fetch();

    if ($existing_lead) {
        // Update existing record instead of creating duplicate
        $update_stmt = $pdo->prepare("
            UPDATE leads SET
                first_name = ?, last_name = ?, phone = ?, business_name = ?,
                trade_type = ?, location = ?, current_marketing = ?, message = ?,
                source = ?, ip_address = ?, user_agent = ?, submitted_at = ?
            WHERE email = ?
        ");

        $update_stmt->execute([
            $data['first_name'], $data['last_name'], $data['phone'], $data['business_name'],
            $data['trade_type'], $data['location'], $data['current_marketing'], $data['message'],
            $data['source'], $data['ip_address'], $data['user_agent'], $data['submitted_at'],
            $data['email']
        ]);

        $lead_id = $existing_lead['id'];
    } else {
        // Insert new lead
        $insert_stmt = $pdo->prepare("
            INSERT INTO leads (
                first_name, last_name, email, phone, business_name, trade_type,
                location, current_marketing, message, source, ip_address, user_agent, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $insert_stmt->execute([
            $data['first_name'], $data['last_name'], $data['email'], $data['phone'],
            $data['business_name'], $data['trade_type'], $data['location'], $data['current_marketing'],
            $data['message'], $data['source'], $data['ip_address'], $data['user_agent'], $data['submitted_at']
        ]);

        $lead_id = $pdo->lastInsertId();
    }

    // Send email notification (optional)
    $email_subject = "New Lead from {$data['trade_type']} in {$data['location']}";
    $email_body = "
        New lead submission from seo-leads-1 page:

        Name: {$data['first_name']} {$data['last_name']}
        Email: {$data['email']}
        Phone: {$data['phone']}
        Business: {$data['business_name']}
        Trade: {$data['trade_type']}
        Location: {$data['location']}
        Marketing Spend: {$data['current_marketing']}
        Message: {$data['message']}

        Submitted: {$data['submitted_at']}
        IP: {$data['ip_address']}
    ";

    // Uncomment the line below to send email notifications
    // mail('info@weltodigital.com', $email_subject, $email_body, 'From: noreply@weltodigital.com');

    echo json_encode([
        'success' => true,
        'message' => 'Lead submitted successfully',
        'lead_id' => $lead_id
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);

} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
}
?>