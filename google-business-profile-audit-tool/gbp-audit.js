// Google Business Profile Audit Tool JavaScript
class GBPAudit {
    constructor() {
        this.auditCriteria = this.initializeAuditCriteria();
        this.initializeEventListeners();
    }

    initializeAuditCriteria() {
        return {
            basic: {
                name: "Basic Information",
                weight: 0.25,
                items: {
                    'business-name': { weight: 10, text: 'Business name is complete and accurate' },
                    'business-address': { weight: 10, text: 'Complete business address is provided' },
                    'phone-number': { weight: 8, text: 'Phone number is accurate and local' },
                    'website-url': { weight: 8, text: 'Website URL is current and working' },
                    'business-category': { weight: 7, text: 'Primary business category is selected' },
                    'additional-categories': { weight: 5, text: 'Additional relevant categories are added' }
                }
            },
            contact: {
                name: "Business Hours & Contact",
                weight: 0.15,
                items: {
                    'special-hours': { weight: 6, text: 'Special hours for holidays are set' },
                    'service-areas': { weight: 5, text: 'Service areas are defined (if applicable)' },
                    'attributes': { weight: 7, text: 'Business attributes are selected and accurate' },
                    'appointment-url': { weight: 4, text: 'Appointment or booking URL is added (if applicable)' }
                }
            },
            photos: {
                name: "Photos & Visual Content",
                weight: 0.20,
                items: {
                    'profile-photo': { weight: 10, text: 'High-quality logo/profile photo is uploaded' },
                    'cover-photo': { weight: 9, text: 'Cover photo showcases business effectively' },
                    'interior-photos': { weight: 7, text: 'Interior photos show workspace/premises' },
                    'exterior-photos': { weight: 6, text: 'Exterior photos show building/storefront' },
                    'product-photos': { weight: 8, text: 'Product/service photos are included' },
                    'team-photos': { weight: 5, text: 'Team/staff photos are included' }
                }
            },
            description: {
                name: "Business Description & Attributes",
                weight: 0.15,
                items: {
                    'business-description': { weight: 9, text: 'Business description is complete and keyword-optimized' },
                    'services-offered': { weight: 8, text: 'Services/products are clearly described' },
                    'from-business': { weight: 6, text: '"From the business" section is utilized' },
                    'accessibility': { weight: 5, text: 'Accessibility attributes are set (if applicable)' }
                }
            },
            reviews: {
                name: "Reviews & Engagement",
                weight: 0.15,
                items: {
                    'review-responses': { weight: 10, text: 'Recent reviews have professional responses' },
                    'review-volume': { weight: 8, text: 'Good volume of recent reviews (5+ in last 6 months)' },
                    'review-rating': { weight: 9, text: 'Overall rating is 4.0+ stars' },
                    'review-strategy': { weight: 6, text: 'Active review generation strategy is in place' }
                }
            },
            posts: {
                name: "Posts & Updates",
                weight: 0.10,
                items: {
                    'recent-posts': { weight: 8, text: 'Posts within the last 30 days' },
                    'post-variety': { weight: 6, text: 'Variety of post types (offers, events, products, news)' },
                    'post-images': { weight: 7, text: 'Posts include high-quality images' },
                    'call-to-action': { weight: 5, text: 'Posts include clear calls-to-action' },
                    'local-keywords': { weight: 4, text: 'Posts include local keywords and location mentions' }
                }
            }
        };
    }

    initializeEventListeners() {
        // Run audit button
        document.getElementById('runAuditBtn').addEventListener('click', () => this.runAudit());

        // Reset audit button
        document.getElementById('resetAuditBtn').addEventListener('click', () => this.resetAudit());

        // Real-time scoring on checkbox changes
        document.querySelectorAll('.audit-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateScoring());
        });
    }

    runAudit() {
        const checkedBoxes = document.querySelectorAll('.audit-checkbox:checked');

        if (checkedBoxes.length === 0) {
            alert('Please check at least one audit item to see your results.');
            return;
        }

        this.calculateScores();
        this.displayResults();
        this.showRecommendations();
        this.showNextSteps();

        // Show results section
        const resultsSection = document.getElementById('auditResults');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    calculateScores() {
        const scores = {};
        let totalPossibleScore = 0;
        let totalActualScore = 0;

        // Calculate category scores based on checked checkboxes
        Object.keys(this.auditCriteria).forEach(categoryKey => {
            const category = this.auditCriteria[categoryKey];
            let categoryPossibleScore = 0;
            let categoryActualScore = 0;

            // Get all checkboxes for this category
            const categoryCheckboxes = document.querySelectorAll(`input[data-category="${categoryKey}"]`);

            categoryCheckboxes.forEach(checkbox => {
                const weight = parseInt(checkbox.dataset.weight) || 1;
                categoryPossibleScore += weight;
                if (checkbox.checked) {
                    categoryActualScore += weight;
                }
            });

            const categoryPercentage = categoryPossibleScore > 0 ?
                Math.round((categoryActualScore / categoryPossibleScore) * 100) : 0;

            scores[categoryKey] = {
                name: category.name,
                percentage: categoryPercentage,
                actualScore: categoryActualScore,
                possibleScore: categoryPossibleScore,
                weight: category.weight
            };

            // Add to overall totals (weighted)
            totalPossibleScore += categoryPossibleScore * category.weight;
            totalActualScore += categoryActualScore * category.weight;
        });

        // Calculate overall score
        const overallScore = totalPossibleScore > 0 ?
            Math.round((totalActualScore / totalPossibleScore) * 100) : 0;

        this.scores = {
            overall: overallScore,
            categories: scores
        };
    }

    displayResults() {
        // Overall score
        const overallScoreElement = document.getElementById('overallScore');
        const overallScore = this.scores.overall;

        overallScoreElement.textContent = `${overallScore}%`;
        overallScoreElement.className = `score ${this.getScoreClass(overallScore)}`;

        // Score interpretation
        document.getElementById('scoreInterpretation').textContent = this.getScoreInterpretation(overallScore);

        // Category breakdown
        const categoryScores = document.getElementById('categoryScores');
        categoryScores.innerHTML = '';

        Object.keys(this.scores.categories).forEach(categoryKey => {
            const category = this.scores.categories[categoryKey];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-score-item';

            categoryDiv.innerHTML = `
                <div class="category-score-header">
                    <span class="category-name">${category.name}</span>
                    <span class="score ${this.getScoreClass(category.percentage)}">${category.percentage}%</span>
                </div>
                <div class="category-score-bar">
                    <div class="score-fill" style="width: ${category.percentage}%"></div>
                </div>
                <div class="category-score-detail">
                    ${category.actualScore}/${category.possibleScore} items completed
                </div>
            `;

            categoryScores.appendChild(categoryDiv);
        });
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    getScoreInterpretation(score) {
        if (score >= 90) {
            return "Excellent! Your Google Business Profile is very well optimized.";
        } else if (score >= 75) {
            return "Good optimization! A few improvements could boost your local SEO performance.";
        } else if (score >= 50) {
            return "Fair optimization. Several improvements needed to maximize your local search visibility.";
        } else if (score >= 25) {
            return "Poor optimization. Significant improvements required for effective local SEO.";
        } else {
            return "Critical optimization needed. Your profile needs immediate attention to compete locally.";
        }
    }

    showRecommendations() {
        const recommendationsContainer = document.getElementById('recommendationsList');
        recommendationsContainer.innerHTML = '';

        // Find unchecked items to create recommendations
        const recommendations = [];

        Object.keys(this.auditCriteria).forEach(categoryKey => {
            const category = this.auditCriteria[categoryKey];
            const categoryScore = this.scores.categories[categoryKey].percentage;

            // Get all checkboxes for this category
            const categoryCheckboxes = document.querySelectorAll(`input[data-category="${categoryKey}"]`);

            categoryCheckboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    const weight = parseInt(checkbox.dataset.weight) || 1;
                    const text = checkbox.nextElementSibling.textContent.trim();

                    recommendations.push({
                        category: category.name,
                        text: text,
                        priority: this.getRecommendationPriority(weight, categoryScore),
                        weight: weight
                    });
                }
            });
        });

        // Sort recommendations by priority and weight
        recommendations.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }
            return b.weight - a.weight; // Higher weight first
        });

        // Display top recommendations
        const topRecommendations = recommendations.slice(0, 8);

        if (topRecommendations.length === 0) {
            recommendationsContainer.innerHTML = '<li class="recommendation-item">🎉 Congratulations! Your Google Business Profile is fully optimized.</li>';
        } else {
            topRecommendations.forEach(rec => {
                const li = document.createElement('li');
                li.className = 'recommendation-item';
                li.innerHTML = `
                    <span class="recommendation-category">${rec.category}:</span>
                    <span class="recommendation-text">${rec.text}</span>
                `;
                recommendationsContainer.appendChild(li);
            });
        }
    }

    getRecommendationPriority(itemWeight, categoryScore) {
        // Higher weight items in lower scoring categories get higher priority
        const weightFactor = itemWeight / 10; // Normalize to 0-1
        const scoreFactor = (100 - categoryScore) / 100; // Normalize to 0-1, inverted
        return weightFactor * scoreFactor;
    }

    showNextSteps() {
        const nextStepsContainer = document.getElementById('nextStepsList');
        nextStepsContainer.innerHTML = '';

        const overallScore = this.scores.overall;
        const nextSteps = [];

        // Generate next steps based on score and categories
        if (overallScore < 30) {
            nextSteps.push(
                "Focus on completing basic information first (business name, address, phone, website)",
                "Add a professional logo and cover photo to your profile",
                "Write a compelling business description with relevant keywords",
                "Set accurate business hours and special holiday hours"
            );
        } else if (overallScore < 60) {
            nextSteps.push(
                "Upload high-quality photos of your business interior, exterior, and products/services",
                "Complete all relevant business attributes and categories",
                "Start actively responding to customer reviews",
                "Begin posting regular updates about your business"
            );
        } else if (overallScore < 80) {
            nextSteps.push(
                "Optimize your business description with local keywords",
                "Add more variety to your photo collection (team, at-work, products)",
                "Implement a systematic review generation strategy",
                "Post consistently (at least weekly) with engaging content"
            );
        } else {
            nextSteps.push(
                "Maintain your excellent optimization with regular updates",
                "Continue engaging with customers through posts and review responses",
                "Monitor your profile regularly for any new features or attributes",
                "Consider advanced strategies like Q&A optimization and local SEO"
            );
        }

        // Add category-specific next steps for low-scoring categories
        Object.keys(this.scores.categories).forEach(categoryKey => {
            const categoryScore = this.scores.categories[categoryKey];
            if (categoryScore.percentage < 50) {
                switch (categoryKey) {
                    case 'basic':
                        if (!nextSteps.some(step => step.includes('basic information'))) {
                            nextSteps.push("Complete all basic information fields in your profile");
                        }
                        break;
                    case 'photos':
                        if (!nextSteps.some(step => step.includes('photos'))) {
                            nextSteps.push("Add professional photos showcasing your business, products, and team");
                        }
                        break;
                    case 'reviews':
                        if (!nextSteps.some(step => step.includes('review'))) {
                            nextSteps.push("Develop a strategy for generating and responding to customer reviews");
                        }
                        break;
                    case 'posts':
                        if (!nextSteps.some(step => step.includes('post'))) {
                            nextSteps.push("Start posting regular updates, offers, and business news");
                        }
                        break;
                }
            }
        });

        // Add general improvement step
        nextSteps.push("Schedule monthly profile reviews to ensure information stays current and optimized");

        // Display the steps
        nextSteps.slice(0, 6).forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.className = 'next-step-item';
            nextStepsContainer.appendChild(li);
        });
    }

    updateScoring() {
        if (this.hasResults()) {
            this.calculateScores();
            this.displayResults();
            this.showRecommendations();
            this.showNextSteps();
        }
    }

    hasResults() {
        return document.getElementById('auditResults').style.display === 'block';
    }

    resetAudit() {
        // Uncheck all checkboxes
        document.querySelectorAll('.audit-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Hide results
        document.getElementById('auditResults').style.display = 'none';

        // Clear scores
        this.scores = null;

        // Scroll to top of form
        document.getElementById('auditForm').scrollIntoView({ behavior: 'smooth' });
    }

    // Export functionality
    exportResults() {
        if (!this.scores) {
            alert('Please run the audit first to export results.');
            return;
        }

        const exportData = {
            auditDate: new Date().toISOString().split('T')[0],
            overallScore: this.scores.overall,
            categories: this.scores.categories,
            completedItems: this.getCompletedItems()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gbp-audit-results-${exportData.auditDate}.json`;
        link.click();
    }

    getCompletedItems() {
        const completed = [];
        document.querySelectorAll('.audit-checkbox:checked').forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            if (label) {
                completed.push({
                    id: checkbox.id,
                    text: label.textContent.trim()
                });
            }
        });
        return completed;
    }
}

// Initialize the audit tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GBPAudit();
});