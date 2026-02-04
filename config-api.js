// Auto-detect API URL based on environment
function getAPIUrl() {
    // Manual override (useful when frontend is hosted on GitHub Pages)
    if (window.__API_URL__) return window.__API_URL__;
    // If explicitly set earlier in appConfig, use it
    if (window.appConfig && window.appConfig.API_URL) return window.appConfig.API_URL;
    // Local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5002';
    }
    // Default to the current origin (useful when backend is served from same host)
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
}

window.appConfig = window.appConfig || {};
window.appConfig.API_URL = getAPIUrl();

// Optional: allow explicit WebSocket URL override
if (window.__WS_URL__) window.appConfig.WS_URL = window.__WS_URL__;

console.log('🔧 API URL configured:', window.appConfig.API_URL);
if (window.appConfig.WS_URL) console.log('🔧 WebSocket URL configured:', window.appConfig.WS_URL);
