import { supabase } from './supabase-client.js';

/**
 * Submit lead form data to Supabase
 * @param {FormData|Object} formData - Form data to submit
 * @returns {Promise<{success: boolean, message: string, lead_id?: string}>}
 */
export async function submitLead(formData) {
    try {
        // Convert FormData to object if needed
        let data;
        if (formData instanceof FormData) {
            data = Object.fromEntries(formData.entries());
        } else {
            data = formData;
        }

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'business_name', 'trade_type', 'location', 'current_marketing'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

        if (missingFields.length > 0) {
            return {
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                success: false,
                message: 'Invalid email address'
            };
        }

        // Prepare data for Supabase
        const leadData = {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            business_name: data.business_name.trim(),
            trade_type: data.trade_type.trim(),
            location: data.location.trim(),
            current_marketing: data.current_marketing.trim(),
            message: (data.message || '').trim(),
            source: 'seo-leads-1',
            ip_address: '', // Will be filled by server if needed
            user_agent: navigator.userAgent,
            submitted_at: new Date().toISOString()
        };

        // Insert into Supabase
        const { data: result, error } = await supabase
            .from('leads')
            .insert([leadData])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return {
                success: false,
                message: 'Failed to submit lead. Please try again later.',
                error: error.message
            };
        }

        return {
            success: true,
            message: 'Lead submitted successfully',
            lead_id: result[0]?.id
        };

    } catch (error) {
        console.error('Submit lead error:', error);
        return {
            success: false,
            message: 'An error occurred. Please try again later.'
        };
    }
}

/**
 * Submit lead form using traditional form submission
 * @param {HTMLFormElement} form - The form element
 * @returns {Promise<{success: boolean, message: string, lead_id?: string}>}
 */
export async function submitLeadForm(form) {
    const formData = new FormData(form);
    return await submitLead(formData);
}

// Example usage for forms
export function setupFormSubmission(formSelector = '#lead-form') {
    const form = document.querySelector(formSelector);
    if (!form) {
        console.warn(`Form with selector "${formSelector}" not found`);
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn?.textContent;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        try {
            const result = await submitLeadForm(form);

            if (result.success) {
                form.reset();
                // Show success message
                alert('Thank you! Your lead has been submitted successfully.');
            } else {
                // Show error message
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            alert('An unexpected error occurred. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}