// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});

// Smooth Scrolling for Navigation Links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Update navigation links to use smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
    }
});

// Contact Form Handling
function openContactForm() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Focus on the name field after scrolling
        setTimeout(() => {
            const nameField = document.getElementById('name');
            if (nameField) {
                nameField.focus();
            }
        }, 1000);
    }
}

// Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Basic form validation
            if (!validateForm(data)) {
                return;
            }

            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                showSuccessMessage();
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
});

function validateForm(data) {
    const requiredFields = ['name', 'email', 'phone', 'business-type', 'location'];

    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showError(`Please fill in the ${field.replace('-', ' ')} field.`);
            return false;
        }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address.');
        return false;
    }

    return true;
}

function showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.form-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            text-align: center;
        `;
        document.querySelector('.contact-form').prepend(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccessMessage() {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.style.cssText = `
        background: #27ae60;
        color: white;
        padding: 1.5rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-align: center;
        animation: fadeInUp 0.5s ease-out;
    `;
    successDiv.innerHTML = `
        <strong>Thank you!</strong><br>
        We've received your request and will send your free SEO audit within 24 hours.
        One of our specialists will also contact you to discuss your business goals.
    `;

    const form = document.querySelector('.contact-form');
    form.prepend(successDiv);

    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Remove success message after 10 seconds
    setTimeout(() => {
        if (successDiv && successDiv.parentNode) {
            successDiv.remove();
        }
    }, 10000);
}

// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .industry-card, .case-study, .feature');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            // UK phone number formatting
            if (value.startsWith('44')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                value = '+44' + value.substring(1);
            } else if (value.length > 0 && !value.startsWith('+')) {
                value = '+44' + value;
            }

            e.target.value = value;
        });
    }
});

// Google Analytics (placeholder - replace with actual tracking code)
function initGA() {
    // Initialize Google Analytics here
    console.log('Google Analytics would be initialized here');
}

// Call to action tracking
function trackCTA(action, label) {
    // Track CTA clicks for analytics
    console.log(`CTA Tracked: ${action} - ${label}`);

    // Example: gtag('event', action, { 'event_label': label });
}

// Add CTA tracking to buttons
document.addEventListener('DOMContentLoaded', function() {
    const primaryButtons = document.querySelectorAll('.btn-primary');
    const secondaryButtons = document.querySelectorAll('.btn-secondary');

    primaryButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            trackCTA('click_primary_cta', `primary_button_${index + 1}`);
        });
    });

    secondaryButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            trackCTA('click_secondary_cta', `secondary_button_${index + 1}`);
        });
    });
});

// Performance monitoring
function measurePageLoadTime() {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page load time: ${Math.round(loadTime)}ms`);

        // Send to analytics if needed
        // gtag('event', 'timing_complete', {
        //     'name': 'page_load',
        //     'value': Math.round(loadTime)
        // });
    });
}

// Initialize performance monitoring
measurePageLoadTime();

// Lazy loading for images (if any are added later)
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);