// Supabase support removed — provide minimal stubs to avoid runtime errors
console.warn('⚠️ Supabase support removed from this build. Supabase helpers are stubbed.');

window.supabaseHelpers = {
	fetchTracksFromSupabase: async () => {
		console.warn('fetchTracksFromSupabase called but Supabase removed; returning empty array');
		return [];
	},
	fetchTrackByCode: async () => {
		console.warn('fetchTrackByCode called but Supabase removed; returning null');
		return null;
	},
	fetchTrackCourses: async () => {
		console.warn('fetchTrackCourses called but Supabase removed; returning empty array');
		return [];
	},
	fetchUserTrack: async () => {
		console.warn('fetchUserTrack called but Supabase removed; returning null');
		return null;
	}
};
