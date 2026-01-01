// Title Tag & Meta Description Checker JavaScript
class TitleChecker {
    constructor() {
        this.initializeEventListeners();
        this.setupRealTimeValidation();
    }

    initializeEventListeners() {
        document.getElementById('fetchBtn').addEventListener('click', () => this.fetchMetaTags());
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeMetaTags());

        // Real-time character counting
        document.getElementById('titleInput').addEventListener('input', () => this.updateCharacterCounts());
        document.getElementById('descriptionInput').addEventListener('input', () => this.updateCharacterCounts());
    }

    setupRealTimeValidation() {
        // Update character counts on page load
        this.updateCharacterCounts();

        // Auto-analyze when both fields have content
        document.getElementById('titleInput').addEventListener('input', () => this.maybeAutoAnalyze());
        document.getElementById('descriptionInput').addEventListener('input', () => this.maybeAutoAnalyze());
    }

    updateCharacterCounts() {
        const titleInput = document.getElementById('titleInput');
        const descriptionInput = document.getElementById('descriptionInput');
        const titleCount = document.getElementById('titleCount');
        const descriptionCount = document.getElementById('descriptionCount');

        // Update title count
        const titleLength = titleInput.value.length;
        titleCount.textContent = `${titleLength}/60`;

        if (titleLength > 60) {
            titleCount.classList.add('over-limit');
            titleCount.classList.remove('optimal', 'under-limit');
        } else if (titleLength >= 30) {
            titleCount.classList.add('optimal');
            titleCount.classList.remove('over-limit', 'under-limit');
        } else if (titleLength > 0) {
            titleCount.classList.add('under-limit');
            titleCount.classList.remove('over-limit', 'optimal');
        } else {
            titleCount.classList.remove('over-limit', 'optimal', 'under-limit');
        }

        // Update description count
        const descLength = descriptionInput.value.length;
        descriptionCount.textContent = `${descLength}/160`;

        if (descLength > 160) {
            descriptionCount.classList.add('over-limit');
            descriptionCount.classList.remove('optimal', 'under-limit');
        } else if (descLength >= 120) {
            descriptionCount.classList.add('optimal');
            descriptionCount.classList.remove('over-limit', 'under-limit');
        } else if (descLength > 0) {
            descriptionCount.classList.add('under-limit');
            descriptionCount.classList.remove('over-limit', 'optimal');
        } else {
            descriptionCount.classList.remove('over-limit', 'optimal', 'under-limit');
        }

        // Update real-time feedback
        this.updateRealTimeFeedback(titleLength, descLength);
    }

    updateRealTimeFeedback(titleLength, descLength) {
        const titleFeedback = document.getElementById('titleFeedback');
        const descriptionFeedback = document.getElementById('descriptionFeedback');

        // Title feedback
        if (titleLength === 0) {
            titleFeedback.textContent = '';
        } else if (titleLength < 30) {
            titleFeedback.textContent = 'Title is too short. Aim for 50-60 characters.';
            titleFeedback.className = 'input-feedback warning';
        } else if (titleLength <= 60) {
            titleFeedback.textContent = 'Perfect! Title length is optimal for search results.';
            titleFeedback.className = 'input-feedback success';
        } else {
            titleFeedback.textContent = 'Title is too long and may be truncated in search results.';
            titleFeedback.className = 'input-feedback error';
        }

        // Description feedback
        if (descLength === 0) {
            descriptionFeedback.textContent = '';
        } else if (descLength < 120) {
            descriptionFeedback.textContent = 'Description could be longer to provide more information.';
            descriptionFeedback.className = 'input-feedback warning';
        } else if (descLength <= 160) {
            descriptionFeedback.textContent = 'Excellent! Description length is optimal for search results.';
            descriptionFeedback.className = 'input-feedback success';
        } else {
            descriptionFeedback.textContent = 'Description is too long and may be truncated.';
            descriptionFeedback.className = 'input-feedback error';
        }
    }

    maybeAutoAnalyze() {
        const title = document.getElementById('titleInput').value.trim();
        const description = document.getElementById('descriptionInput').value.trim();

        if (title.length > 10 || description.length > 20) {
            // Auto-analyze after a brief delay to avoid too frequent updates
            clearTimeout(this.autoAnalyzeTimeout);
            this.autoAnalyzeTimeout = setTimeout(() => {
                this.analyzeMetaTags(false); // false = don't scroll to results
            }, 1000);
        }
    }

    async fetchMetaTags() {
        const urlInput = document.getElementById('urlInput');
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL to fetch meta tags');
            return;
        }

        const fetchBtn = document.getElementById('fetchBtn');
        const originalText = fetchBtn.textContent;
        fetchBtn.textContent = 'Fetching...';
        fetchBtn.disabled = true;

        try {
            // Since we can't directly fetch due to CORS, we'll simulate the process
            // In a real implementation, you'd need a backend service
            await this.simulateFetch(url);
        } catch (error) {
            console.error('Error fetching meta tags:', error);
            alert('Unable to fetch meta tags. Please enter them manually or try a different URL.');
        } finally {
            fetchBtn.textContent = originalText;
            fetchBtn.disabled = false;
        }
    }

    async simulateFetch(url) {
        // Simulate a fetch delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Extract domain for preview
        try {
            const urlObj = new URL(url);
            document.getElementById('urlInput').setAttribute('data-domain', urlObj.hostname);

            // For demonstration, we'll show how it would work
            // In reality, you'd need a backend service to fetch the actual meta tags
            const demoTitle = `Page Title from ${urlObj.hostname}`;
            const demoDescription = `This is a sample meta description fetched from ${urlObj.hostname}. In a real implementation, this would be the actual meta description from the page.`;

            document.getElementById('titleInput').value = demoTitle;
            document.getElementById('descriptionInput').value = demoDescription;
            this.updateCharacterCounts();

            alert('Demo: In a real implementation, this would fetch the actual title and meta description from the URL.');
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    analyzeMetaTags(scrollToResults = true) {
        const title = document.getElementById('titleInput').value.trim();
        const description = document.getElementById('descriptionInput').value.trim();
        const urlInput = document.getElementById('urlInput').value.trim();

        if (!title && !description) {
            alert('Please enter a title tag and/or meta description to analyze');
            return;
        }

        // Update SERP preview
        this.updateSERPPreview(title, description, urlInput);

        // Analyze title tag
        const titleAnalysis = this.analyzeTitleTag(title);
        this.updateTitleAnalysis(titleAnalysis);

        // Analyze meta description
        const descriptionAnalysis = this.analyzeMetaDescription(description);
        this.updateDescriptionAnalysis(descriptionAnalysis);

        // Calculate overall score
        const overallScore = this.calculateOverallScore(titleAnalysis, descriptionAnalysis);
        this.updateOverallScore(overallScore);

        // Show results
        const resultsSection = document.getElementById('toolResults');
        resultsSection.style.display = 'block';

        if (scrollToResults) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateSERPPreview(title, description, url) {
        const serpUrl = document.getElementById('serpUrl');
        const serpTitle = document.getElementById('serpTitle');
        const serpDescription = document.getElementById('serpDescription');

        // Update URL
        if (url) {
            try {
                const urlObj = new URL(url);
                serpUrl.textContent = urlObj.hostname + urlObj.pathname;
            } catch {
                serpUrl.textContent = url.replace(/^https?:\/\//, '');
            }
        } else {
            serpUrl.textContent = 'yourwebsite.com/page';
        }

        // Update title (truncate if too long)
        const displayTitle = title || 'Your Page Title';
        serpTitle.textContent = displayTitle.length > 60 ? displayTitle.substring(0, 57) + '...' : displayTitle;

        // Update description (truncate if too long)
        const displayDescription = description || 'Your meta description appears here to give users a preview of your page content...';
        serpDescription.textContent = displayDescription.length > 160 ? displayDescription.substring(0, 157) + '...' : displayDescription;
    }

    analyzeTitleTag(title) {
        const analysis = {
            length: title.length,
            status: '',
            score: 0,
            recommendations: []
        };

        if (title.length === 0) {
            analysis.status = 'Missing';
            analysis.score = 0;
            analysis.recommendations.push('Add a title tag to help search engines understand your page');
        } else if (title.length < 30) {
            analysis.status = 'Too Short';
            analysis.score = 40;
            analysis.recommendations.push('Title is too short - aim for 50-60 characters');
            analysis.recommendations.push('Include your main keyword and make it descriptive');
        } else if (title.length <= 60) {
            analysis.status = 'Optimal';
            analysis.score = 100;
            analysis.recommendations.push('Perfect length! Your title will display fully in search results');
        } else if (title.length <= 70) {
            analysis.status = 'Slightly Long';
            analysis.score = 75;
            analysis.recommendations.push('Title may be truncated in search results');
            analysis.recommendations.push('Consider shortening to 60 characters or less');
        } else {
            analysis.status = 'Too Long';
            analysis.score = 50;
            analysis.recommendations.push('Title is too long and will be truncated');
            analysis.recommendations.push('Shorten to 60 characters to avoid truncation');
        }

        // Additional checks
        if (title.toLowerCase().includes('home') || title.toLowerCase().includes('welcome')) {
            analysis.score -= 10;
            analysis.recommendations.push('Avoid generic terms like "Home" or "Welcome"');
        }

        if (title.split('|').length > 2 || title.split('-').length > 2) {
            analysis.recommendations.push('Avoid too many separators in your title');
        }

        return analysis;
    }

    analyzeMetaDescription(description) {
        const analysis = {
            length: description.length,
            status: '',
            score: 0,
            recommendations: []
        };

        if (description.length === 0) {
            analysis.status = 'Missing';
            analysis.score = 0;
            analysis.recommendations.push('Add a meta description to control how your page appears in search results');
        } else if (description.length < 120) {
            analysis.status = 'Too Short';
            analysis.score = 60;
            analysis.recommendations.push('Description is too short - aim for 150-160 characters');
            analysis.recommendations.push('Provide more details to entice users to click');
        } else if (description.length <= 160) {
            analysis.status = 'Optimal';
            analysis.score = 100;
            analysis.recommendations.push('Perfect length! Description will display fully in search results');
        } else if (description.length <= 180) {
            analysis.status = 'Slightly Long';
            analysis.score = 80;
            analysis.recommendations.push('Description may be truncated in search results');
            analysis.recommendations.push('Consider shortening to 160 characters or less');
        } else {
            analysis.status = 'Too Long';
            analysis.score = 50;
            analysis.recommendations.push('Description is too long and will be truncated');
            analysis.recommendations.push('Shorten to 160 characters to avoid truncation');
        }

        // Additional checks
        if (description.includes('...')) {
            analysis.recommendations.push('Avoid using ellipsis (... ) as Google may add them automatically');
        }

        if (!description.match(/[.!?]$/)) {
            analysis.recommendations.push('Consider ending with proper punctuation for better readability');
        }

        return analysis;
    }

    updateTitleAnalysis(analysis) {
        document.getElementById('titleLength').textContent = `${analysis.length} characters`;

        const statusElement = document.getElementById('titleStatus');
        statusElement.textContent = analysis.status;
        statusElement.className = `metric-status ${analysis.status.toLowerCase().replace(' ', '-')}`;

        const recommendations = document.getElementById('titleRecommendations');
        recommendations.innerHTML = analysis.recommendations.map(rec =>
            `<div class="recommendation">${rec}</div>`
        ).join('');
    }

    updateDescriptionAnalysis(analysis) {
        document.getElementById('descriptionLength').textContent = `${analysis.length} characters`;

        const statusElement = document.getElementById('descriptionStatus');
        statusElement.textContent = analysis.status;
        statusElement.className = `metric-status ${analysis.status.toLowerCase().replace(' ', '-')}`;

        const recommendations = document.getElementById('descriptionRecommendations');
        recommendations.innerHTML = analysis.recommendations.map(rec =>
            `<div class="recommendation">${rec}</div>`
        ).join('');
    }

    calculateOverallScore(titleAnalysis, descriptionAnalysis) {
        const titleWeight = 0.6; // Title is more important
        const descriptionWeight = 0.4;

        const score = Math.round(
            (titleAnalysis.score * titleWeight) +
            (descriptionAnalysis.score * descriptionWeight)
        );

        let feedback = '';
        let scoreClass = '';

        if (score >= 90) {
            feedback = 'Excellent! Your meta tags are well optimized for search engines.';
            scoreClass = 'excellent';
        } else if (score >= 75) {
            feedback = 'Good optimization with room for minor improvements.';
            scoreClass = 'good';
        } else if (score >= 60) {
            feedback = 'Moderate optimization. Consider implementing the recommendations above.';
            scoreClass = 'moderate';
        } else if (score >= 40) {
            feedback = 'Poor optimization. Your meta tags need significant improvement.';
            scoreClass = 'poor';
        } else {
            feedback = 'Critical issues found. Please address the recommendations to improve SEO.';
            scoreClass = 'critical';
        }

        return { score, feedback, scoreClass };
    }

    updateOverallScore({ score, feedback, scoreClass }) {
        document.getElementById('scoreNumber').textContent = score;
        document.getElementById('scoreFeedback').textContent = feedback;

        const scoreDisplay = document.getElementById('scoreDisplay');
        scoreDisplay.className = `score-display ${scoreClass}`;
    }
}

// Initialize the title checker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TitleChecker();
});