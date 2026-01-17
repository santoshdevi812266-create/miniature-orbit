// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://csaqawuizxptaswtvbla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFhd3VpenhwdGFzd3R2YmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTE4MjYsImV4cCI6MjA4NDEyNzgyNn0._N2ICI79KQpIfvfRHLES1WQZrCU1NDUUL2fOgTHyaSo';

// Initialize Supabase Client
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        };
    }

    async query(table, method = 'GET', data = null, filters = '') {
        try {
            let endpoint = `${this.url}/rest/v1/${table}`;
            let options = {
                method,
                headers: this.headers
            };

            if (filters) {
                endpoint += `?${filters}`;
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
    }

    // Products methods
    async getProducts() {
        return this.query('products', 'GET');
    }

    async addProduct(product) {
        return this.query('products', 'POST', product);
    }

    async updateProduct(id, product) {
        return this.query(`products?id=eq.${id}`, 'PATCH', product);
    }

    // Bills/Orders methods
    async saveBill(bill) {
        return this.query('bills', 'POST', bill);
    }

    async getBills() {
        return this.query('bills', 'GET');
    }

    // Customers methods
    async saveCustomer(customer) {
        return this.query('customers', 'POST', customer);
    }

    async getCustomers() {
        return this.query('customers', 'GET');
    }

    // Bill Items methods
    async saveBillItems(items) {
        return this.query('bill_items', 'POST', items);
    }
}

// Initialize client
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
