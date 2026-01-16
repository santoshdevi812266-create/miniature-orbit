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
    }

    async loadProducts() {
        try {
            this.products = await supabase.getProducts();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    async addProduct(product) {
        try {
            const result = await supabase.addProduct(product);
            this.products.push(result);
            return result;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        try {
            await supabase.updateProduct(id, product);
            const index = this.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...product };
            }
            return this.products[index];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            await supabase.query(`products?id=eq.${id}`, 'DELETE');
            this.products = this.products.filter(p => p.id !== id);
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    searchProducts(query) {
        return this.products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.barcode.includes(query)
        );
    }

    getProductByBarcode(barcode) {
        return this.products.find(p => p.barcode === barcode);
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
