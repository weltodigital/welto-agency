<?php
// CSV export for leads
// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'welto_leads',
    'username' => 'root',
    'password' => ''
];

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Filters
    $trade_filter = $_GET['trade'] ?? '';
    $date_from = $_GET['date_from'] ?? '';
    $date_to = $_GET['date_to'] ?? '';

    // Build query
    $where_conditions = [];
    $params = [];

    if ($trade_filter) {
        $where_conditions[] = "trade_type = ?";
        $params[] = $trade_filter;
    }

    if ($date_from) {
        $where_conditions[] = "DATE(submitted_at) >= ?";
        $params[] = $date_from;
    }

    if ($date_to) {
        $where_conditions[] = "DATE(submitted_at) <= ?";
        $params[] = $date_to;
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // Get leads
    $stmt = $pdo->prepare("
        SELECT
            first_name,
            last_name,
            email,
            phone,
            business_name,
            trade_type,
            location,
            current_marketing,
            message,
            source,
            submitted_at
        FROM leads
        $where_clause
        ORDER BY submitted_at DESC
    ");
    $stmt->execute($params);

    // Generate filename
    $date_suffix = date('Y-m-d');
    $filter_suffix = $trade_filter ? "_" . $trade_filter : '';
    $filename = "welto_leads_{$date_suffix}{$filter_suffix}.csv";

    // Set headers for CSV download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Create output stream
    $output = fopen('php://output', 'w');

    // Add CSV headers
    fputcsv($output, [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Business Name',
        'Trade Type',
        'Location',
        'Marketing Spend',
        'Message',
        'Source',
        'Submitted Date'
    ]);

    // Add data rows
    while ($row = $stmt->fetch()) {
        fputcsv($output, [
            $row['first_name'],
            $row['last_name'],
            $row['email'],
            $row['phone'],
            $row['business_name'],
            ucwords(str_replace('_', ' ', $row['trade_type'])),
            $row['location'],
            '£' . $row['current_marketing'],
            $row['message'],
            $row['source'],
            date('Y-m-d H:i:s', strtotime($row['submitted_at']))
        ]);
    }

    fclose($output);

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
} catch (Exception $e) {
    die("Export error: " . $e->getMessage());
}
?>