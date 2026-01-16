// Initialize Supabase Client using Official JS SDK
const SUPABASE_URL = 'https://csaqawuizxptaswtvbla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFhd3VpenhwdGFzd3R2YmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTE4MjYsImV4cCI6MjA4NDEyNzgyNn0._N2ICI79KQpIfvfRHLES1WQZrCU1NDUUL2fOgTHyaSo';

// Wait for Supabase library to load
let supabase = null;
let supabaseReady = false;

async function initSupabase() {
    try {
        // Check if loaded via CDN
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseReady = true;
            console.log('✓ Supabase client initialized with realtime support');
            return supabase;
        } else {
            console.warn('⚠ Supabase library not loaded from CDN, retrying...');
            // Retry after a moment
            setTimeout(initSupabase, 500);
        }
    } catch (err) {
        console.error('✗ Failed to initialize Supabase:', err);
    }
}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

// Export for use
window.supabaseClient = { 
    get: () => supabase,
    isReady: () => supabaseReady
};
