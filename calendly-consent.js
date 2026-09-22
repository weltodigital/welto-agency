/**
 * Click-to-load for the Calendly embed.
 *
 * Calendly's widget sets its own cookies, which PECR reg. 6 says we may not do
 * before the visitor asks for it. So the booking calendar is a placeholder until
 * it is clicked; nothing third-party loads on page view.
 */
(function () {
    'use strict';

    var WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';
    var WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
    var loading = false;

    function loadWidgetAssets() {
        if (loading) return;
        loading = true;

        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = WIDGET_CSS;
        document.head.appendChild(css);

        var script = document.createElement('script');
        script.src = WIDGET_SRC;
        script.async = true;
        document.body.appendChild(script);
    }

    function reveal(placeholder) {
        var widget = document.createElement('div');
        widget.className = 'calendly-inline-widget';
        widget.setAttribute('data-url', placeholder.getAttribute('data-url'));
        widget.style.minWidth = '320px';
        widget.style.height = '700px';

        placeholder.replaceWith(widget);
        loadWidgetAssets();
    }

    document.addEventListener('click', function (event) {
        var button = event.target.closest('.calendly-placeholder__button');
        if (!button) return;

        var placeholder = button.closest('.calendly-placeholder');
        if (placeholder) reveal(placeholder);
    });
})();
