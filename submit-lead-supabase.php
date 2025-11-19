<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

loadEnv(__DIR__ . '/.env');

// Supabase configuration
$supabase_url = $_ENV['NEXT_PUBLIC_SUPABASE_URL'] ?? 'https://ddtyovjdxdfpqjemmtyp.supabase.co';
$supabase_key = $_ENV['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODIzMjYsImV4cCI6MjA3OTE1ODMyNn0.uIGMXSqbUg-5HOVQUznYwBb1GAetPqpi0aJ5iVKj8Y0';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
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

    // Prepare data for Supabase
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
        'submitted_at' => date('c') // ISO 8601 format for Supabase
    ];

    // Insert data into Supabase using REST API
    $supabase_endpoint = $supabase_url . '/rest/v1/leads';

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $supabase_endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'apikey: ' . $supabase_key,
            'Authorization: Bearer ' . $supabase_key,
            'Prefer: return=representation'
        ],
    ]);

    $response = curl_exec($curl);
    $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($curl);
    curl_close($curl);

    if ($curl_error) {
        throw new Exception('Curl error: ' . $curl_error);
    }

    if ($http_code === 201) {
        $result = json_decode($response, true);

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
            'lead_id' => $result[0]['id'] ?? null
        ]);
    } else {
        $error_response = json_decode($response, true);
        error_log("Supabase error (HTTP $http_code): " . $response);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit lead. Please try again later.',
            'error' => $error_response['message'] ?? 'Unknown error'
        ]);
    }

} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
}
?>