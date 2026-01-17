// Initialize Supabase Client using Official JS SDK
const SUPABASE_URL = 'https://csaqawuizxptaswtvbla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFhd3VpenhwdGFzd3R2YmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTE4MjYsImV4cCI6MjA4NDEyNzgyNn0._N2ICI79KQpIfvfRHLES1WQZrCU1NDUUL2fOgTHyaSo';

// Wait for Supabase library to load
let supabase = null;
let supabaseReady = false;
let supabaseInitPromise = null;

function initSupabase() {
    if (supabaseInitPromise) return supabaseInitPromise;
    
    supabaseInitPromise = new Promise((resolve) => {
        function tryInit() {
            if (window.supabase && window.supabase.createClient) {
                try {
                    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    supabaseReady = true;
                    console.log('✓ Supabase client initialized with realtime support');
                    resolve(supabase);
                } catch (err) {
                    console.error('✗ Failed to create Supabase client:', err);
                    resolve(null);
                }
            } else {
                // Retry in 100ms
                setTimeout(tryInit, 100);
            }
        }
        tryInit();
    });
    
    return supabaseInitPromise;
}

// Initialize immediately
initSupabase();

// Export for use
window.supabaseClient = { 
    get: () => supabase,
    isReady: () => supabaseReady,
    init: () => initSupabase()
};
