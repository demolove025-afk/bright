// Configuration file for environment variables
const config = {
	// API Configuration - use 127.0.0.1:5002 to match running server
	API_URL: 'http://127.0.0.1:5002',
	
	// Supabase Configuration
	SUPABASE_URL: 'https://dftnznkpaiybmchgumgb.supabase.co',
	SUPABASE_ANON_KEY: 'sb_publishable_O1scB7CJUXjpZB9zetArEw_HQPEXkm6',
	
	// Feature flags
	DEBUG_MODE: true
};

// Export for use in other scripts
window.appConfig = config;

// Log config on load for debugging
console.log('✅ Config loaded:', { 
	apiUrl: config.API_URL, 
	debugMode: config.DEBUG_MODE 
});
