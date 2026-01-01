// Local Keyword Ideas Tool JavaScript
class KeywordGenerator {
    constructor() {
        this.initializeEventListeners();
        this.locationModifiers = [
            'near me',
            'in {location}',
            '{location}',
            'local',
            'close by',
            'nearby',
            'in my area'
        ];

        this.serviceModifiers = [
            'emergency',
            '24 hour',
            '24/7',
            'same day',
            'urgent',
            'local',
            'professional',
            'qualified',
            'certified',
            'experienced',
            'reliable',
            'affordable',
            'cheap',
            'best',
            'top rated',
            'recommended'
        ];

        this.actionWords = [
            'services',
            'company',
            'contractor',
            'specialist',
            'expert',
            'professional',
            'business',
            'repair',
            'installation',
            'maintenance',
            'call out',
            'quotes',
            'estimates',
            'cost',
            'price',
            'rates'
        ];

        this.tradeSpecificTerms = {
            'electrician': [
                'electrical work', 'wiring', 'fuse box', 'rewiring', 'electrical installation',
                'electrical repair', 'electrical testing', 'electrical certification', 'electrical inspection',
                'socket installation', 'lighting installation', 'electrical fault finding',
                'consumer unit', 'electrical safety', 'PAT testing', 'EICR', 'electrical upgrade'
            ],
            'plumber': [
                'plumbing', 'boiler repair', 'boiler installation', 'heating', 'central heating',
                'leak repair', 'pipe repair', 'bathroom installation', 'toilet repair', 'tap repair',
                'drain unblocking', 'boiler service', 'power flush', 'radiator repair', 'combi boiler',
                'gas safe', 'water heater', 'immersion heater', 'thermostatic valve'
            ],
            'builder': [
                'building work', 'extension', 'renovation', 'construction', 'building services',
                'home extension', 'loft conversion', 'kitchen extension', 'garage conversion',
                'groundwork', 'foundation', 'brickwork', 'roofing', 'plastering', 'rendering',
                'structural work', 'planning permission', 'building regulations'
            ],
            'tree surgeon': [
                'tree removal', 'tree cutting', 'tree pruning', 'stump grinding', 'tree surgery',
                'hedge cutting', 'tree felling', 'crown reduction', 'tree maintenance',
                'dangerous tree removal', 'tree inspection', 'arborist', 'forestry', 'tree care'
            ],
            'roofer': [
                'roofing', 'roof repair', 'roof replacement', 'roof installation', 'guttering',
                'roof tiles', 'flat roof', 'slate roof', 'roof leak', 'roof maintenance',
                'chimney repair', 'fascia', 'soffit', 'roof inspection', 'emergency roof repair'
            ],
            'gas engineer': [
                'gas safety', 'gas certificate', 'gas inspection', 'gas leak', 'gas appliance',
                'gas cooker installation', 'gas hob installation', 'gas fire installation',
                'gas safety check', 'landlord gas certificate', 'gas boiler', 'combi boiler'
            ],
            'carpenter': [
                'carpentry', 'joinery', 'kitchen fitting', 'custom furniture', 'bespoke furniture',
                'fitted wardrobes', 'shelving', 'door hanging', 'skirting boards', 'architrave',
                'decking', 'fencing', 'wooden flooring', 'laminate flooring'
            ],
            'carpet cleaner': [
                'carpet cleaning', 'rug cleaning', 'upholstery cleaning', 'stain removal',
                'steam cleaning', 'dry cleaning', 'deep clean', 'professional cleaning',
                'end of tenancy cleaning', 'commercial carpet cleaning'
            ],
            'carpet fitter': [
                'carpet fitting', 'carpet installation', 'flooring', 'vinyl flooring',
                'laminate flooring', 'wooden flooring', 'floor covering', 'carpet laying',
                'underlay installation', 'stair carpet'
            ],
            'garden landscaper': [
                'landscaping', 'garden design', 'garden maintenance', 'lawn care',
                'patio installation', 'driveway installation', 'fencing', 'artificial grass',
                'garden clearance', 'tree planting', 'hedge planting', 'garden renovation'
            ]
        };
    }

    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateKeywords());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyKeywords());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportKeywords());
    }

    generateKeywords() {
        const trade = document.getElementById('tradeInput').value;
        const location = document.getElementById('locationInput').value.trim();
        const customService = document.getElementById('customService').value.trim();

        if (!trade || !location) {
            alert('Please select your trade and enter your location');
            return;
        }

        const keywords = this.createKeywordVariations(trade, location, customService);
        this.displayKeywords(keywords);
    }

    createKeywordVariations(trade, location, customService) {
        const keywords = new Set();

        // Basic trade + location combinations
        this.locationModifiers.forEach(modifier => {
            const locationPhrase = modifier.replace('{location}', location);
            keywords.add(`${trade} ${locationPhrase}`);
            keywords.add(`${locationPhrase} ${trade}`);
        });

        // Service modifier combinations
        this.serviceModifiers.forEach(modifier => {
            keywords.add(`${modifier} ${trade}`);
            keywords.add(`${modifier} ${trade} ${location}`);
            keywords.add(`${modifier} ${trade} near me`);
            keywords.add(`${trade} ${modifier} service`);
            keywords.add(`${trade} ${modifier} service ${location}`);
        });

        // Action word combinations
        this.actionWords.forEach(action => {
            keywords.add(`${trade} ${action}`);
            keywords.add(`${trade} ${action} ${location}`);
            keywords.add(`${trade} ${action} near me`);
            keywords.add(`local ${trade} ${action}`);
            keywords.add(`${location} ${trade} ${action}`);
        });

        // Trade-specific terms
        if (this.tradeSpecificTerms[trade]) {
            this.tradeSpecificTerms[trade].forEach(term => {
                keywords.add(`${term} ${location}`);
                keywords.add(`${term} near me`);
                keywords.add(`local ${term}`);
                keywords.add(`${term} service`);
                keywords.add(`${term} specialist`);
                keywords.add(`${term} ${location} cost`);
                keywords.add(`${term} ${location} price`);
                keywords.add(`emergency ${term}`);
                keywords.add(`24 hour ${term}`);
            });
        }

        // Custom service combinations
        if (customService) {
            this.locationModifiers.forEach(modifier => {
                const locationPhrase = modifier.replace('{location}', location);
                keywords.add(`${customService} ${locationPhrase}`);
                keywords.add(`${trade} ${customService} ${location}`);
            });

            this.serviceModifiers.forEach(modifier => {
                keywords.add(`${modifier} ${customService}`);
                keywords.add(`${modifier} ${customService} ${location}`);
            });
        }

        // Long-tail variations
        keywords.add(`best ${trade} in ${location}`);
        keywords.add(`top ${trade} ${location}`);
        keywords.add(`${trade} reviews ${location}`);
        keywords.add(`${trade} recommendations ${location}`);
        keywords.add(`how much does a ${trade} cost in ${location}`);
        keywords.add(`${trade} call out charge ${location}`);
        keywords.add(`find a ${trade} ${location}`);
        keywords.add(`hire a ${trade} ${location}`);
        keywords.add(`${location} ${trade} directory`);
        keywords.add(`${location} ${trade} company`);

        return Array.from(keywords).sort();
    }

    displayKeywords(keywords) {
        const resultsSection = document.getElementById('toolResults');
        const keywordsGrid = document.getElementById('keywordsGrid');
        const keywordCount = document.getElementById('keywordCount');

        // Update count
        keywordCount.textContent = `${keywords.length} keywords generated`;

        // Clear previous results
        keywordsGrid.innerHTML = '';

        // Create keyword elements
        keywords.forEach(keyword => {
            const keywordElement = document.createElement('div');
            keywordElement.className = 'keyword-item';
            keywordElement.textContent = keyword;
            keywordElement.addEventListener('click', () => this.copyToClipboard(keyword));
            keywordsGrid.appendChild(keywordElement);
        });

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Store keywords for export
        this.currentKeywords = keywords;
    }

    copyKeywords() {
        if (!this.currentKeywords) return;

        const keywordText = this.currentKeywords.join('\n');
        this.copyToClipboard(keywordText);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show feedback
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'var(--success-green)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    exportKeywords() {
        if (!this.currentKeywords) return;

        const trade = document.getElementById('tradeInput').value;
        const location = document.getElementById('locationInput').value;

        // Create CSV content
        const csvContent = [
            'Keyword,Trade,Location,Length',
            ...this.currentKeywords.map(keyword =>
                `"${keyword}","${trade}","${location}",${keyword.length}`
            )
        ].join('\n');

        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${trade}-${location}-keywords.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the keyword generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new KeywordGenerator();
});