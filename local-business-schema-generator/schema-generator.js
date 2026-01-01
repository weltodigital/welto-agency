// Local Business Schema Generator JavaScript
class SchemaGenerator {
    constructor() {
        this.initializeEventListeners();
        this.initializeClosedCheckboxes();
    }

    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateSchema());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copySchema());

        // Real-time updates when key fields change
        ['businessNameInput', 'businessTypeInput'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                if (this.hasResults()) {
                    this.generateSchema();
                }
            });
        });

        // Handle closed checkboxes
        document.querySelectorAll('.closed-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleClosedDay(e));
        });
    }

    initializeClosedCheckboxes() {
        // Set Sunday as closed by default
        const sundayCheckbox = document.querySelector('[data-day="Sunday"].closed-checkbox');
        if (sundayCheckbox) {
            this.handleClosedDay({ target: sundayCheckbox });
        }
    }

    handleClosedDay(event) {
        const checkbox = event.target;
        const day = checkbox.dataset.day;
        const dayRow = checkbox.closest('.day-hours');
        const timeInputs = dayRow.querySelectorAll('.time-input');

        if (checkbox.checked) {
            // Disable time inputs when closed
            timeInputs.forEach(input => {
                input.disabled = true;
                input.style.opacity = '0.5';
            });
        } else {
            // Enable time inputs when open
            timeInputs.forEach(input => {
                input.disabled = false;
                input.style.opacity = '1';
            });
        }
    }

    hasResults() {
        return document.getElementById('toolResults').style.display !== 'none';
    }

    generateSchema() {
        // Get form values
        const businessType = document.getElementById('businessTypeInput').value;
        const businessName = document.getElementById('businessNameInput').value.trim();

        if (!businessType || !businessName) {
            alert('Please enter at least a business name and type to generate schema markup.');
            return;
        }

        // Collect all business information
        const businessData = this.collectBusinessData();

        // Generate schema object
        const schema = this.buildSchemaObject(businessData);

        // Display results
        this.displaySchema(schema);

        // Show results section
        const resultsSection = document.getElementById('toolResults');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    collectBusinessData() {
        return {
            type: document.getElementById('businessTypeInput').value,
            name: document.getElementById('businessNameInput').value.trim(),
            description: document.getElementById('descriptionInput').value.trim(),
            streetAddress: document.getElementById('streetAddressInput').value.trim(),
            city: document.getElementById('cityInput').value.trim(),
            postcode: document.getElementById('postcodeInput').value.trim(),
            country: document.getElementById('countryInput').value,
            phone: document.getElementById('phoneInput').value.trim(),
            email: document.getElementById('emailInput').value.trim(),
            website: document.getElementById('websiteInput').value.trim(),
            openingHours: this.collectOpeningHours()
        };
    }

    collectOpeningHours() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const openingHours = [];

        days.forEach(day => {
            const closedCheckbox = document.querySelector(`[data-day="${day}"].closed-checkbox`);

            if (!closedCheckbox.checked) {
                const openTime = document.querySelector(`[data-day="${day}"][data-type="open"]`).value;
                const closeTime = document.querySelector(`[data-day="${day}"][data-type="close"]`).value;

                if (openTime && closeTime) {
                    // Convert day to abbreviated form for schema
                    const dayAbbr = day.substring(0, 2);
                    openingHours.push(`${dayAbbr} ${openTime}-${closeTime}`);
                }
            }
        });

        return openingHours;
    }

    buildSchemaObject(data) {
        const schema = {
            "@context": "https://schema.org",
            "@type": data.type || "LocalBusiness"
        };

        // Required fields
        if (data.name) schema.name = data.name;
        if (data.description) schema.description = data.description;
        if (data.website) schema.url = data.website;

        // Address
        if (data.streetAddress || data.city || data.postcode) {
            schema.address = {
                "@type": "PostalAddress"
            };

            if (data.streetAddress) schema.address.streetAddress = data.streetAddress;
            if (data.city) schema.address.addressLocality = data.city;
            if (data.postcode) schema.address.postalCode = data.postcode;
            if (data.country) schema.address.addressCountry = data.country;
        }

        // Contact information
        if (data.phone) schema.telephone = data.phone;
        if (data.email) schema.email = data.email;

        // Opening hours
        if (data.openingHours && data.openingHours.length > 0) {
            schema.openingHours = data.openingHours;
        }

        // Add business-specific properties based on type
        this.addBusinessTypeProperties(schema, data.type);

        return schema;
    }

    addBusinessTypeProperties(schema, businessType) {
        // Add properties specific to certain business types
        switch (businessType) {
            case 'Restaurant':
            case 'FoodEstablishment':
                schema.servesCuisine = "Various"; // Could be made configurable
                break;

            case 'ProfessionalService':
                schema.serviceType = "Professional Services"; // Could be made configurable
                break;

            case 'MedicalOrganization':
                schema.medicalSpecialty = "General Practice"; // Could be made configurable
                break;

            case 'AutomotiveBusiness':
                schema.serviceType = "Automotive Services"; // Could be made configurable
                break;

            case 'HomeAndConstructionBusiness':
                schema.serviceType = "Home and Construction Services"; // Could be made configurable
                break;
        }

        // Add common properties for local businesses
        schema.priceRange = "$$"; // Could be made configurable
    }

    displaySchema(schema) {
        const codeBlock = document.getElementById('schemaCode');
        const formattedJson = JSON.stringify(schema, null, 2);

        // Wrap in script tag for display
        const fullMarkup = `<script type="application/ld+json">
${formattedJson}
</script>`;

        codeBlock.textContent = fullMarkup;

        // Store the schema for copying
        this.generatedSchema = fullMarkup;
    }

    copySchema() {
        if (!this.generatedSchema) {
            alert('Please generate schema markup first.');
            return;
        }

        navigator.clipboard.writeText(this.generatedSchema).then(() => {
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
            textArea.value = this.generatedSchema;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            alert('Schema markup copied to clipboard!');
        });
    }

    // Validation helpers
    validateInput(data) {
        const errors = [];

        if (!data.name) {
            errors.push('Business name is required');
        }

        if (!data.type) {
            errors.push('Business type is required');
        }

        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (data.website && !this.isValidUrl(data.website)) {
            errors.push('Please enter a valid website URL');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Initialize the schema generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SchemaGenerator();
});