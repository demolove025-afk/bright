// Auto-detect API URL based on environment
function getAPIUrl() {
    // If on Render (production domain)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
    }
    // If on localhost (development)
    return 'http://127.0.0.1:5002';
}

window.appConfig = {
    API_URL: getAPIUrl()
};

console.log('🔧 API URL configured:', window.appConfig.API_URL);
