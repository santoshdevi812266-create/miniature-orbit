// Security Camera Integration
class SecurityCamera {
    constructor(containerId, cameraUrl) {
        this.containerId = containerId;
        this.cameraUrl = cameraUrl; // RTSP or HTTP stream URL
        this.iframe = null;
    }

    initialize() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn(`Container ${this.containerId} not found`);
            return false;
        }

        try {
            // Support multiple camera types
            if (this.cameraUrl) {
                this.loadCameraFeed(container);
            } else {
                this.showPlaceholder(container);
            }
            return true;
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.showPlaceholder(container);
            return false;
        }
    }

    loadCameraFeed(container) {
        container.innerHTML = '';
        
        // Check if it's an HTTP/HTTPS stream
        if (this.cameraUrl.startsWith('http')) {
            const img = document.createElement('img');
            img.src = this.cameraUrl;
            img.alt = 'Security Camera';
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            `;
            
            img.onerror = () => {
                this.showError(container, 'Camera feed not accessible');
            };
            
            container.appendChild(img);
            
            // Refresh image feed every 2 seconds for MJPEG streams
            setInterval(() => {
                img.src = this.cameraUrl + (this.cameraUrl.includes('?') ? '&' : '?') + Date.now();
            }, 2000);
        } 
        // Support for video streams
        else if (this.cameraUrl.startsWith('rtsp') || this.cameraUrl.endsWith('.m3u8')) {
            const video = document.createElement('video');
            video.src = this.cameraUrl;
            video.controls = false;
            video.autoplay = true;
            video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            `;
            
            video.onerror = () => {
                this.showError(container, 'Video stream not supported');
            };
            
            container.appendChild(video);
        }
    }

    showPlaceholder(container) {
        container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 8px;
                color: white;
                text-align: center;
            ">
                <div>
                    <p style="font-size: 48px; margin-bottom: 10px;">📷</p>
                    <p>Security Camera Feed</p>
                    <small style="color: #999; display: block; margin-top: 10px;">Add camera URL in settings</small>
                </div>
            </div>
        `;
    }

    showError(container, message) {
        container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: #fadbd8;
                border-radius: 8px;
                color: #c0392b;
                text-align: center;
            ">
                <div>
                    <p style="font-size: 48px; margin-bottom: 10px;">⚠️</p>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }

    updateCameraUrl(newUrl) {
        this.cameraUrl = newUrl;
        this.initialize();
    }
}

// Product Management
class ProductManager {
    constructor() {
        this.products = [];
        this.defaultProducts = [
            { id: 1, name: 'Rice (1kg)', barcode: '1001', price: 50, unit: 'kg', category: 'Grains' },
            { id: 2, name: 'Wheat (1kg)', barcode: '1002', price: 45, unit: 'kg', category: 'Grains' },
            { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 55, unit: 'kg', category: 'Grains' },
            { id: 4, name: 'Salt (500g)', barcode: '1004', price: 15, unit: 'g', category: 'Spices' },
            { id: 5, name: 'Oil (1L)', barcode: '1005', price: 120, unit: 'L', category: 'Oils' },
            { id: 6, name: 'Milk (1L)', barcode: '1006', price: 60, unit: 'L', category: 'Dairy' },
            { id: 7, name: 'Bread', barcode: '1007', price: 30, unit: 'pcs', category: 'Bakery' },
            { id: 8, name: 'Butter (500g)', barcode: '1008', price: 280, unit: 'g', category: 'Dairy' },
            { id: 9, name: 'Apple (per kg)', barcode: '1009', price: 100, unit: 'kg', category: 'Fruits' },
            { id: 10, name: 'Banana (bunch)', barcode: '1010', price: 40, unit: 'pcs', category: 'Fruits' }
        ];
    }

    async loadProducts() {
        try {
            console.log('Loading products from Supabase...');
            
            // Check if official supabase client is ready
            if (supabaseReady && supabase) {
                try {
                    const { data, error } = await supabase
                        .from('products')
                        .select('*');
                    
                    if (error) {
                        console.warn('Error loading from Supabase:', error);
                        this.products = this.defaultProducts;
                    } else if (data && data.length > 0) {
                        console.log('✓ Loaded', data.length, 'products from Supabase');
                        this.products = data;
                    } else {
                        console.log('No products in database, using defaults');
                        this.products = this.defaultProducts;
                    }
                } catch (err) {
                    console.error('Failed to fetch from Supabase:', err);
                    this.products = this.defaultProducts;
                }
            } else {
                console.warn('Supabase not ready, using default products');
                this.products = this.defaultProducts;
            }
            
            return this.products;
        } catch (error) {
            console.error('Error in loadProducts:', error);
            this.products = this.defaultProducts;
            return this.products;
        }
    }

    async addProduct(product) {
        try {
            console.log('Adding product:', product);
            
            // Add to local array first
            const newProduct = {
                ...product,
                id: Math.max(...this.products.map(p => p.id || 0), 0) + 1
            };
            this.products.push(newProduct);
            
            // Try to save to Supabase if available
            if (supabaseReady && supabase) {
                try {
                    const { data, error } = await supabase
                        .from('products')
                        .insert([newProduct])
                        .select();
                    
                    if (error) {
                        console.warn('Error saving to Supabase:', error);
                    } else {
                        console.log('✓ Product saved to Supabase');
                    }
                } catch (err) {
                    console.warn('Failed to save to Supabase, using local only:', err);
                }
            }
            
            return newProduct;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        try {
            // Update local array
            const index = this.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...product };
            }
            
            // Try to update in Supabase if available
            if (supabaseReady && supabase) {
                try {
                    const { error } = await supabase
                        .from('products')
                        .update(product)
                        .eq('id', id);
                    
                    if (error) {
                        console.warn('Error updating in Supabase:', error);
                    } else {
                        console.log('✓ Product updated in Supabase');
                    }
                } catch (err) {
                    console.warn('Failed to update in Supabase, using local only:', err);
                }
            }
            
            return this.products[index];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            // Delete from local array
            this.products = this.products.filter(p => p.id !== id);
            
            // Try to delete from Supabase if available
            if (supabaseReady && supabase) {
                try {
                    const { error } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', id);
                    
                    if (error) {
                        console.warn('Error deleting from Supabase:', error);
                    } else {
                        console.log('✓ Product deleted from Supabase');
                    }
                } catch (err) {
                    console.warn('Failed to delete from Supabase, using local only:', err);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    searchProducts(query) {
        return this.products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.barcode && p.barcode.toString().includes(query))
        );
    }

    getProductByBarcode(barcode) {
        return this.products.find(p => p.barcode && p.barcode.toString() === barcode.toString());
    }
}

// Sales Analytics
class SalesAnalytics {
    constructor() {
        this.bills = [];
    }

    async loadBills() {
        try {
            this.bills = await supabase.getBills();
            return this.bills;
        } catch (error) {
            console.error('Error loading bills:', error);
            return [];
        }
    }

    getDailySales(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        return this.bills.filter(bill => 
            bill.created_at.startsWith(dateStr)
        );
    }

    getWeeklySales(date = new Date()) {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        return this.bills.filter(bill => {
            const billDate = new Date(bill.created_at);
            return billDate >= startDate && billDate <= endDate;
        });
    }

    getMonthlySales(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        return this.bills.filter(bill => {
            const billDate = new Date(bill.created_at);
            return billDate.getFullYear() === year && billDate.getMonth() === month;
        });
    }

    calculateDailySalesTotal() {
        const daily = this.getDailySales();
        return daily.reduce((sum, bill) => sum + bill.total_amount, 0);
    }

    calculateWeeklySalesTotal() {
        const weekly = this.getWeeklySales();
        return weekly.reduce((sum, bill) => sum + bill.total_amount, 0);
    }

    calculateMonthlySalesTotal() {
        const monthly = this.getMonthlySales();
        return monthly.reduce((sum, bill) => sum + bill.total_amount, 0);
    }

    getDailyChartData(days = 7) {
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            
            const dailySales = this.bills.filter(bill =>
                bill.created_at.startsWith(date.toISOString().split('T')[0])
            );
            
            const total = dailySales.reduce((sum, bill) => sum + bill.total_amount, 0);
            
            data.push({
                date: dateStr,
                total: total,
                transactions: dailySales.length
            });
        }
        return data;
    }

    getWeeklyChartData(weeks = 12) {
        const data = [];
        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (7 * i));
            
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            
            const weekStr = `Week ${Math.ceil(date.getDate() / 7)}`;
            
            const weeklySales = this.bills.filter(bill => {
                const billDate = new Date(bill.created_at);
                return billDate >= startDate && billDate < new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            });
            
            const total = weeklySales.reduce((sum, bill) => sum + bill.total_amount, 0);
            
            data.push({
                week: weekStr,
                total: total,
                transactions: weeklySales.length
            });
        }
        return data;
    }

    getPaymentMethodSummary() {
        const summary = {};
        this.bills.forEach(bill => {
            if (!summary[bill.payment_method]) {
                summary[bill.payment_method] = { count: 0, total: 0 };
            }
            summary[bill.payment_method].count++;
            summary[bill.payment_method].total += bill.total_amount;
        });
        return summary;
    }

    getTopProducts(limit = 10) {
        const products = {};
        
        // This would need bill items data from Supabase
        // For now returning empty array
        return [];
    }
}

// Initialize managers
const productManager = new ProductManager();
const salesAnalytics = new SalesAnalytics();
