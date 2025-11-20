<?php
// Simple admin panel to view leads
// In production, add proper authentication

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

    // Pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $per_page = 25;
    $offset = ($page - 1) * $per_page;

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

    // Get total count
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM leads $where_clause");
    $count_stmt->execute($params);
    $total = $count_stmt->fetch()['total'];

    // Get leads
    $stmt = $pdo->prepare("
        SELECT * FROM leads
        $where_clause
        ORDER BY submitted_at DESC
        LIMIT $per_page OFFSET $offset
    ");
    $stmt->execute($params);
    $leads = $stmt->fetchAll();

    // Get trade types for filter
    $trades_stmt = $pdo->query("SELECT DISTINCT trade_type FROM leads ORDER BY trade_type");
    $trade_types = $trades_stmt->fetchAll(PDO::FETCH_COLUMN);

    $total_pages = ceil($total / $per_page);

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WELTO Leads Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5aa0; color: white; padding: 20px 0; margin-bottom: 20px; }
        .header h1 { text-align: center; }
        .filters { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .filters form { display: flex; gap: 15px; align-items: end; flex-wrap: wrap; }
        .filter-group { display: flex; flex-direction: column; }
        .filter-group label { font-weight: 600; margin-bottom: 5px; }
        .filter-group select, .filter-group input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
        .btn { padding: 8px 16px; background: #2c5aa0; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #1e3f73; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #2c5aa0; }
        .stat-label { color: #6c757d; }
        .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #dee2e6; }
        td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        tr:hover { background: #f8f9fa; }
        .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
        .pagination a, .pagination span { padding: 8px 12px; text-decoration: none; border: 1px solid #dee2e6; border-radius: 4px; }
        .pagination .current { background: #2c5aa0; color: white; }
        .pagination a:hover { background: #f8f9fa; }
        .export-link { float: right; color: #2c5aa0; text-decoration: none; }
        .export-link:hover { text-decoration: underline; }
        .phone, .email { font-family: monospace; }
        .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .badge-electrician { background: #ffd700; color: #333; }
        .badge-plumber { background: #007bff; color: white; }
        .badge-tree-surgeon { background: #28a745; color: white; }
        .badge-other { background: #6c757d; color: white; }
        @media (max-width: 768px) {
            .table-container { overflow-x: auto; }
            .filters form { flex-direction: column; align-items: stretch; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🎯 WELTO Leads Dashboard</h1>
        </div>
    </div>

    <div class="container">
        <!-- Stats -->
        <div class="stats">
            <div class="stats-grid">
                <div class="stat">
                    <div class="stat-number"><?= number_format($total) ?></div>
                    <div class="stat-label">Total Leads</div>
                </div>
                <div class="stat">
                    <div class="stat-number">
                        <?php
                        $today_stmt = $pdo->query("SELECT COUNT(*) FROM leads WHERE DATE(submitted_at) = CURDATE()");
                        echo $today_stmt->fetchColumn();
                        ?>
                    </div>
                    <div class="stat-label">Today</div>
                </div>
                <div class="stat">
                    <div class="stat-number">
                        <?php
                        $week_stmt = $pdo->query("SELECT COUNT(*) FROM leads WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
                        echo $week_stmt->fetchColumn();
                        ?>
                    </div>
                    <div class="stat-label">This Week</div>
                </div>
                <div class="stat">
                    <div class="stat-number">
                        <?php
                        $month_stmt = $pdo->query("SELECT COUNT(*) FROM leads WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
                        echo $month_stmt->fetchColumn();
                        ?>
                    </div>
                    <div class="stat-label">Last 30 Days</div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters">
            <form method="GET">
                <div class="filter-group">
                    <label for="trade">Trade Type</label>
                    <select name="trade" id="trade">
                        <option value="">All Trades</option>
                        <?php foreach ($trade_types as $trade): ?>
                            <option value="<?= htmlspecialchars($trade) ?>" <?= $trade === $trade_filter ? 'selected' : '' ?>>
                                <?= ucwords(str_replace('_', ' ', $trade)) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="date_from">From Date</label>
                    <input type="date" name="date_from" id="date_from" value="<?= htmlspecialchars($date_from) ?>">
                </div>

                <div class="filter-group">
                    <label for="date_to">To Date</label>
                    <input type="date" name="date_to" id="date_to" value="<?= htmlspecialchars($date_to) ?>">
                </div>

                <button type="submit" class="btn">Filter</button>
                <a href="?" class="btn" style="background: #6c757d; text-decoration: none;">Clear</a>
            </form>

            <a href="export-leads.php?<?= http_build_query($_GET) ?>" class="export-link">📄 Export CSV</a>
        </div>

        <!-- Leads Table -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Business</th>
                        <th>Trade</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>Marketing Spend</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($leads)): ?>
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: #6c757d;">
                                No leads found matching your criteria.
                            </td>
                        </tr>
                    <?php endif; ?>

                    <?php foreach ($leads as $lead): ?>
                        <tr>
                            <td><?= date('M j, Y g:i A', strtotime($lead['submitted_at'])) ?></td>
                            <td>
                                <strong><?= htmlspecialchars($lead['first_name'] . ' ' . $lead['last_name']) ?></strong>
                            </td>
                            <td><?= htmlspecialchars($lead['business_name']) ?></td>
                            <td>
                                <span class="badge badge-<?= $lead['trade_type'] ?>">
                                    <?= ucwords(str_replace('_', ' ', $lead['trade_type'])) ?>
                                </span>
                            </td>
                            <td><?= htmlspecialchars($lead['location']) ?></td>
                            <td>
                                <div class="email"><?= htmlspecialchars($lead['email']) ?></div>
                                <div class="phone"><?= htmlspecialchars($lead['phone']) ?></div>
                            </td>
                            <td>£<?= htmlspecialchars($lead['current_marketing']) ?></td>
                            <td style="max-width: 200px;">
                                <?= htmlspecialchars(substr($lead['message'], 0, 100)) ?>
                                <?= strlen($lead['message']) > 100 ? '...' : '' ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <?php if ($total_pages > 1): ?>
            <div class="pagination">
                <?php if ($page > 1): ?>
                    <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page - 1])) ?>">« Prev</a>
                <?php endif; ?>

                <?php for ($i = max(1, $page - 2); $i <= min($total_pages, $page + 2); $i++): ?>
                    <?php if ($i === $page): ?>
                        <span class="current"><?= $i ?></span>
                    <?php else: ?>
                        <a href="?<?= http_build_query(array_merge($_GET, ['page' => $i])) ?>"><?= $i ?></a>
                    <?php endif; ?>
                <?php endfor; ?>

                <?php if ($page < $total_pages): ?>
                    <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page + 1])) ?>">Next »</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>