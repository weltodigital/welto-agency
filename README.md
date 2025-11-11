# WELTO Agency Website

A high-converting SEO agency website specifically designed to attract local trade businesses including electricians, plumbers, tree surgeons, and other tradespeople.

## 🎯 Key Features

- **Local SEO Optimized**: Built with local search optimisation in mind
- **Trade-Focused Content**: Specifically targets electricians, plumbers, and tree surgeons
- **Mobile-First Design**: Fully responsive for all devices
- **High Converting**: Optimized for lead generation and customer acquisition
- **Fast Loading**: Optimized for performance and SEO
- **Schema Markup**: Rich snippets for better search visibility

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open index.html** in your web browser
3. **Customize** the content for your specific needs
4. **Deploy** to your hosting platform

## 📁 File Structure

```
welto-agency/
├── index.html          # Main website file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── package.json        # Project metadata
└── README.md          # This file
```

## 🎨 Customization Guide

### Colors & Branding

The main brand colors are defined in CSS variables in `styles.css`:

```css
:root {
    --primary-blue: #004bad;
    --light-blue: #0066cc;
    --dark-blue: #003380;
    /* Update these to match your brand */
}
```

### Content Customization

1. **Company Name**: Replace "WELTO" throughout the site
2. **Contact Information**: Update phone numbers and email addresses
3. **Service Areas**: Modify location-specific content
4. **Case Studies**: Replace with your own client success stories
5. **Statistics**: Update numbers to reflect your business metrics

### SEO Optimization

The site includes several SEO optimisations:

- **Meta Tags**: Title, description, keywords
- **Schema Markup**: Organization and service markup
- **Open Graph**: Social media sharing optimisation
- **Local Keywords**: Targeted at trade services
- **Internal Linking**: Proper navigation structure

### Key Sections to Update:

1. **Contact Information** (multiple locations in code)
2. **Service Areas** - Update for your target locations
3. **Case Studies** - Replace with your client results
4. **Statistics** - Update with your business metrics
5. **Schema Markup** - Update business information

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🔧 Technical Features

### Performance Optimizations
- Minimal HTTP requests
- Optimized CSS and JavaScript
- Lazy loading ready (for images)
- Mobile-first approach

### JavaScript Features
- Smooth scrolling navigation
- Mobile menu toggle
- Form validation
- Contact form handling
- Performance monitoring
- Analytics ready

### SEO Features
- Semantic HTML5 structure
- Proper heading hierarchy
- Meta descriptions
- Schema.org markup
- Local business optimisation
- Fast loading times

## 📊 Analytics Setup

To add Google Analytics:

1. Replace the placeholder in `script.js`:
```javascript
// Replace this function with actual GA code
function initGA() {
    // Add your Google Analytics tracking code here
}
```

2. Add your tracking ID to the HTML head section

## 📞 Contact Form Setup

The contact form currently shows success/error messages. To make it functional:

1. **Replace the form submission** in `script.js`
2. **Add backend endpoint** for form processing
3. **Update email settings** for notifications

Example backend integration:
```javascript
// In script.js, replace the setTimeout simulation with:
fetch('/contact', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        showSuccessMessage();
    } else {
        showError(data.message);
    }
});
```

## 🎯 Target Keywords

The site is optimised for these primary keywords:
- Local SEO for electricians
- Plumber SEO services
- Tree surgeon marketing
- Local trade business SEO
- [Location] electrician SEO
- Emergency plumber marketing

## 🚀 Deployment

### Static Hosting (Recommended)
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to GitHub repo
- **GitHub Pages**: Push to repository

### Traditional Hosting
- Upload all files to your web hosting cPanel
- Ensure index.html is in the root directory
- Update any absolute paths if necessary

## 📈 Performance Tips

1. **Optimize Images**: Compress images before adding them
2. **CDN**: Use a CDN for static assets
3. **Caching**: Enable browser caching on your server
4. **Minification**: Minify CSS and JavaScript for production

## 🛠 Maintenance

### Regular Updates Needed:
1. **Content Refresh**: Update case studies and statistics quarterly
2. **Keyword Optimization**: Review and update keywords based on performance
3. **Technical SEO**: Regular SEO audits and improvements
4. **Performance**: Monitor page speed and optimise as needed

## 📞 Support

For questions about customization or deployment, refer to the code comments or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.