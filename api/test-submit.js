export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        console.log('Request received');
        console.log('Method:', req.method);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);

        // Just return success with the data we received
        return res.status(200).json({
            success: true,
            message: 'Test endpoint working',
            receivedData: req.body,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Test endpoint error:', error);
        return res.status(500).json({
            success: false,
            message: 'Test endpoint error: ' + error.message
        });
    }
}