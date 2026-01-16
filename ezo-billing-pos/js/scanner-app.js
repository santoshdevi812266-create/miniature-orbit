// Scanner App Main Logic
class ScannerApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.recentScans = [];
        this.scanner = null;
        this.currentPayment = null;
        this.billNumber = this.generateBillNumber();
        this.totalScans = 0;
        this.sessionId = null;
        this.isConnected = false;
        this.broadcastChannel = null;
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Scanner App...');
        
        // Load products
        await this.loadProducts();
        
        // Initialize barcode scanner
        this.initializeScanner();
        
        // Initialize camera barcode detector (if available)
        this.cameraStream = null;
        this.cameraScanning = false;
        if ('BarcodeDetector' in window) {
            try {
                this.barcodeDetector = new BarcodeDetector({formats: ['ean_13','code_128','qr_code']});
            } catch (e) {
                this.barcodeDetector = null;
            }
        } else {
            this.barcodeDetector = null;
        }
        
        // Update date and time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Set focus to barcode input
        document.getElementById('barcodeInput').focus();
    }

    async connectWithUsername() {
        console.log('Connect button clicked');
        
        // Ensure Supabase is ready
        if (!supabaseReady || !supabase) {
            this.showAlert('Supabase not ready yet. Please wait a moment and try again.', 'warning');
            console.warn('Supabase not ready:', { supabaseReady, supabase: !!supabase });
            return;
        }

        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();
        console.log('Username input:', username);

        if (!username) {
            this.showAlert('Please enter a username', 'warning');
            return;
        }

        this.username = username;

        // Setup Supabase realtime channel using username
        this.broadcastChannel = supabase
            .channel(`pos-scanner-${username}`)
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.isConnected = true;
                    this.updateSessionStatus(true);
                    this.showAlert('✅ Connected to main POS!', 'success');
                    usernameInput.disabled = true;
                } else if (status === 'CHANNEL_ERROR') {
                    this.isConnected = false;
                    this.updateSessionStatus(false);
                    this.showAlert('❌ Connection failed', 'danger');
                }
            });

        console.log('Connected with username:', username);
    }

    async broadcastOpenAddProduct(barcode) {
        if (!this.isConnected || !this.broadcastChannel) return;
        try {
            await this.broadcastChannel.send({
                type: 'broadcast',
                event: 'open_add_product',
                payload: { barcode: barcode, timestamp: new Date().toISOString() }
            });
            this.showAlert('Requested main POS to open Add Product', 'info');
        } catch (err) {
            console.error('Error broadcasting open_add_product:', err);
        }
    }

    updateSessionStatus(connected) {
        const statusEl = document.getElementById('sessionStatus');
        if (connected) {
            statusEl.className = 'session-status status-connected';
            statusEl.innerHTML = '<span class="sync-indicator connected"></span><span>✅ Connected as ' + (this.username || 'user') + '</span>';
        } else {
            statusEl.className = 'session-status status-disconnected';
            statusEl.innerHTML = '<span class="sync-indicator"></span><span>❌ Not connected</span>';
        }
    }

    async broadcastBarcodeToMainPOS(product, quantity) {
        if (!this.isConnected || !this.broadcastChannel) {
            this.showAlert('Not connected to main POS. Please connect first.', 'warning');
            return false;
        }

        try {
            // Broadcast barcode scan to main POS
            await this.broadcastChannel.send({
                type: 'broadcast',
                event: 'barcode_scanned',
                payload: {
                    barcode: product.barcode,
                    productName: product.name,
                    quantity: quantity,
                    timestamp: new Date().toISOString()
                }
            });

            this.showAlert(`📤 Sent ${product.name} to main POS`, 'success');
            return true;
        } catch (error) {
            console.error('Error broadcasting barcode:', error);
            this.showAlert('Failed to send to main POS', 'danger');
            return false;
        }
    }

    async loadProducts() {
        try {
            // Sample products - Replace with actual Supabase query
            this.products = [
                { id: 1, name: 'Rice (1kg)', barcode: '8901234567890', price: 80, unit: 'kg', category: 'Groceries' },
                { id: 2, name: 'Wheat (1kg)', barcode: '8901234567891', price: 55, unit: 'kg', category: 'Groceries' },
                { id: 3, name: 'Sugar (1kg)', barcode: '8901234567892', price: 50, unit: 'kg', category: 'Groceries' },
                { id: 4, name: 'Oil (1L)', barcode: '8901234567893', price: 200, unit: 'L', category: 'Groceries' },
                { id: 5, name: 'Salt (1kg)', barcode: '8901234567894', price: 30, unit: 'kg', category: 'Groceries' },
                { id: 6, name: 'Bread', barcode: '8901234567895', price: 40, unit: 'piece', category: 'Bakery' },
                { id: 7, name: 'Milk (1L)', barcode: '8901234567896', price: 60, unit: 'L', category: 'Dairy' },
                { id: 8, name: 'Butter (200g)', barcode: '8901234567897', price: 120, unit: 'g', category: 'Dairy' },
                { id: 9, name: 'Tomato', barcode: '9876543210123', price: 40, unit: 'kg', category: 'Vegetables' },
                { id: 10, name: 'Potato', barcode: '9876543210124', price: 30, unit: 'kg', category: 'Vegetables' },
                { id: 11, name: 'Onion', barcode: '9876543210125', price: 35, unit: 'kg', category: 'Vegetables' },
                { id: 12, name: 'Apple', barcode: '9876543210126', price: 120, unit: 'kg', category: 'Fruits' }
            ];
            console.log('Products loaded:', this.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Error loading products', 'danger');
        }
    }

    initializeScanner() {
        this.scanner = new BarcodeScanner((barcode) => this.handleBarcodeScan(barcode));
        this.scanner.initialize();

        // Also handle manual barcode input
        document.getElementById('barcodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const barcode = document.getElementById('barcodeInput').value.trim();
                if (barcode) {
                    this.handleBarcodeScan(barcode);
                    document.getElementById('barcodeInput').value = '';
                }
            }
        });
    }

    // Camera-based barcode scanning
    async toggleCameraScan() {
        console.log('Toggle camera button clicked, current state:', this.cameraScanning);
        if (this.cameraScanning) {
            this.stopCameraScan();
        } else {
            await this.startCameraScan();
        }
    }

    async startCameraScan() {
        const container = document.getElementById('cameraContainer');
        const video = document.getElementById('cameraVideo');
        const btn = document.getElementById('cameraToggleBtn');

        console.log('Starting camera scan...');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Camera API not supported');
            this.showAlert('Camera API not supported in this browser', 'danger');
            return;
        }

        try {
            console.log('Requesting camera access...');
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            console.log('Camera stream obtained:', this.cameraStream);
            
            video.srcObject = this.cameraStream;
            video.onloadedmetadata = () => {
                console.log('Video metadata loaded, playing...');
                video.play();
            };
            
            container.style.display = 'block';
            btn.textContent = '📷 Stop Camera';
            this.cameraScanning = true;

            console.log('BarcodeDetector available?', this.barcodeDetector ? 'yes' : 'no');
            
            // If browser supports BarcodeDetector, start loop
            if (this.barcodeDetector) {
                console.log('Starting barcode detection loop...');
                this._cameraScanLoop();
            } else {
                this.showAlert('BarcodeDetector API not available; use Capture Frame button', 'info');
            }
        } catch (err) {
            console.error('Camera start error:', err);
            this.showAlert('Unable to access camera: ' + err.message, 'danger');
        }
    }

    stopCameraScan() {
        const container = document.getElementById('cameraContainer');
        const video = document.getElementById('cameraVideo');
        const btn = document.getElementById('cameraToggleBtn');

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(t => t.stop());
            this.cameraStream = null;
        }

        video.srcObject = null;
        container.style.display = 'none';
        btn.textContent = '📷 Use Camera to Scan';
        this.cameraScanning = false;
    }

    async _cameraScanLoop() {
        if (!this.cameraScanning) return;
        
        const video = document.getElementById('cameraVideo');
        if (!video || !this.barcodeDetector) {
            if (this.cameraScanning) requestAnimationFrame(() => this._cameraScanLoop());
            return;
        }

        try {
            // Wait for video to have content before attempting detection
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const bitmap = await createImageBitmap(video);
                const detections = await this.barcodeDetector.detect(bitmap);
                if (detections && detections.length > 0) {
                    const barcode = detections[0].rawValue;
                    if (barcode) {
                        this.handleBarcodeScan(barcode);
                        // small pause to avoid duplicates
                        await new Promise(r => setTimeout(r, 700));
                    }
                }
            }
        } catch (err) {
            console.error('Camera scan error:', err);
            // ignore intermittent errors and continue loop
        }
        
        // loop
        if (this.cameraScanning) requestAnimationFrame(() => this._cameraScanLoop());
    }

    // Manual capture of current frame (useful when BarcodeDetector unsupported)
    async captureFrame() {
        const video = document.getElementById('cameraVideo');
        if (!video || !video.srcObject) {
            this.showAlert('Camera not running', 'warning');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (this.barcodeDetector) {
            try {
                const bitmap = await createImageBitmap(canvas);
                const detections = await this.barcodeDetector.detect(bitmap);
                if (detections && detections.length > 0) {
                    this.handleBarcodeScan(detections[0].rawValue);
                    return;
                } else {
                    this.showAlert('No barcode detected in frame', 'warning');
                }
            } catch (err) {
                console.error('Capture detection error:', err);
                this.showAlert('Failed to detect barcode', 'danger');
            }
        } else {
            this.showAlert('Barcode detection not supported; please type barcode or use a hardware scanner', 'warning');
        }
    }

    async handleBarcodeScan(barcode) {
        this.totalScans++;
        this.updateStats();
        const product = this.products.find(p => p.barcode === barcode);

        // If scanner-only mode is enabled and connected, broadcast immediately
        const scannerOnly = document.getElementById('scannerOnlyMode') && document.getElementById('scannerOnlyMode').checked;
        if (scannerOnly && this.isConnected && this.broadcastChannel) {
            // If product exists locally, send product info; otherwise send barcode only
            const qty = 1;
            if (product) {
                this.broadcastBarcodeToMainPOS(product, qty);
                this.addToRecentScans(product);
            } else {
                // send minimal payload with barcode
                try {
                    await this.broadcastChannel.send({
                        type: 'broadcast',
                        event: 'barcode_scanned',
                        payload: { barcode: barcode, productName: null, quantity: qty, timestamp: new Date().toISOString() }
                    });
                    this.showAlert(`📤 Sent barcode ${barcode} to main POS`, 'success');
                } catch (err) {
                    console.error('Broadcast error:', err);
                    this.showAlert('Failed to send barcode to main POS', 'danger');
                }
            }

            // reset input and UI
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcodeInput').focus();
            return;
        }

        // Legacy behavior: show product info and allow manual add
        const notFoundDiv = document.getElementById('productNotFound');
        const infoDiv = document.getElementById('scannedProductInfo');

        if (!product) {
            notFoundDiv.style.display = 'block';
            infoDiv.style.display = 'none';

            // Prefill add product panel in scanner app
            document.getElementById('prodBarcodeScan').value = barcode;
            document.getElementById('prodNameScan').value = '';
            document.getElementById('prodPriceScan').value = '';
            document.getElementById('prodUnitScan').value = 'pcs';
            document.getElementById('prodCategoryScan').value = '';
            document.getElementById('addProductPanel').style.display = 'block';

            // If connected, request main POS to open its add-product panel
            if (this.isConnected && this.broadcastChannel) {
                this.broadcastOpenAddProduct(barcode);
            }

            setTimeout(() => {
                // keep add panel visible but refocus barcode input for next scan
                document.getElementById('barcodeInput').focus();
            }, 500);
            return;
        }

        // Show product info
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productBarcode').textContent = product.barcode;
        document.getElementById('productPrice').textContent = product.price.toFixed(2);
        document.getElementById('productUnit').textContent = product.unit;
        document.getElementById('unitLabel').textContent = product.unit;
        document.getElementById('scannedQuantity').value = '1';
        
        infoDiv.style.display = 'block';
        notFoundDiv.style.display = 'none';

        // Store current product
        this.currentScannedProduct = product;

        // Add to recent scans
        this.addToRecentScans(product);

        // Auto-focus quantity input
        document.getElementById('scannedQuantity').focus();
    }

    addToRecentScans(product) {
        const timestamp = new Date().toLocaleTimeString('en-IN');
        this.recentScans.unshift({ product, time: timestamp });
        
        // Keep only last 10
        if (this.recentScans.length > 10) {
            this.recentScans.pop();
        }

        this.displayRecentScans();
    }

    displayRecentScans() {
        const container = document.getElementById('recentScans');
        if (this.recentScans.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No scans yet</p>';
            return;
        }

        container.innerHTML = this.recentScans.map((scan, index) => `
            <div style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px;">
                <strong>${scan.product.name}</strong>
                <br><span style="color: #999;">${scan.time} - ₹${scan.product.price}</span>
            </div>
        `).join('');
    }

    addScannedProduct() {
        if (!this.currentScannedProduct) {
            this.showAlert('No product scanned', 'warning');
            return;
        }

        const quantity = parseFloat(document.getElementById('scannedQuantity').value);
        if (isNaN(quantity) || quantity <= 0) {
            this.showAlert('Invalid quantity', 'danger');
            return;
        }

        const product = this.currentScannedProduct;
        
        // If connected to main POS, broadcast the barcode instead of adding to local cart
        if (this.isConnected && this.broadcastChannel) {
            this.broadcastBarcodeToMainPOS(product, quantity);
            
            // Clear the quantity field and focus back to barcode input
            document.getElementById('scannedQuantity').value = '1';
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcodeInput').focus();
            
            // Hide product info
            document.getElementById('scannedProductInfo').style.display = 'none';
            document.getElementById('productNotFound').style.display = 'none';
            
            return;
        }

        // Otherwise, add to local scanner cart (for offline mode)
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.updateBill();
        this.showAlert(`Added ${product.name}`, 'success');
        
        // Reset
        this.currentScannedProduct = null;
        document.getElementById('scannedProductInfo').style.display = 'none';
        document.getElementById('barcodeInput').value = '';
        document.getElementById('barcodeInput').focus();
        document.getElementById('addProductPanel').style.display = 'none';
    }

    // Send new product entered in scanner app to main POS for adding
    async sendNewProductToPos() {
        const barcode = document.getElementById('prodBarcodeScan').value.trim();
        const name = document.getElementById('prodNameScan').value.trim();
        const price = parseFloat(document.getElementById('prodPriceScan').value) || 0;
        const unit = document.getElementById('prodUnitScan').value;
        const category = document.getElementById('prodCategoryScan').value || 'Uncategorized';

        if (!name) {
            this.showAlert('Please enter product name', 'warning');
            return;
        }

        const productPayload = { barcode, name, price, unit, category };

        if (this.isConnected && this.broadcastChannel) {
            try {
                await this.broadcastChannel.send({
                    type: 'broadcast',
                    event: 'add_product',
                    payload: productPayload
                });
                this.showAlert('Sent add-product request to main POS', 'success');
                document.getElementById('addProductPanel').style.display = 'none';
                document.getElementById('barcodeInput').focus();
            } catch (err) {
                console.error('Error sending add_product:', err);
                this.showAlert('Failed to send add request', 'danger');
            }
        } else {
            this.showAlert('Not connected to main POS. Please connect first.', 'warning');
        }
    }

    updateBill() {
        // Update bill items
        const itemsList = document.getElementById('billItemsList');
        
        if (this.cart.length === 0) {
            itemsList.innerHTML = '<p style="text-align: center; color: #999;">No items scanned</p>';
        } else {
            itemsList.innerHTML = this.cart.map((item, index) => `
                <div class="bill-item">
                    <span>${item.name}</span>
                    <span>${item.quantity}${item.unit}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 10px;" onclick="scannerApp.removeFromCart(${index})">×</button>
                </div>
            `).join('');
        }

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
        const tax = (subtotal * taxPercent) / 100;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('billTotal').textContent = total.toFixed(2);
        document.getElementById('modalTotal').textContent = total.toFixed(2);

        this.updateStats();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateBill();
    }

    updateStats() {
        document.getElementById('totalItems').textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0).toFixed(1);
        document.getElementById('uniqueProducts').textContent = this.cart.length;
        document.getElementById('totalScans').textContent = this.totalScans;
    }

    generateBillNumber() {
        const date = new Date();
        const timestamp = date.getTime();
        const randomNum = Math.floor(Math.random() * 1000);
        return `SC${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${randomNum}`;
    }

    updateDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('dateTime').textContent = now.toLocaleDateString('en-IN', options);
        document.getElementById('billId').textContent = this.billNumber;
        document.getElementById('billTime').textContent = now.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 999; max-width: 300px;';
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    openPaymentModal() {
        if (this.cart.length === 0) {
            this.showAlert('Please scan items first!', 'warning');
            return;
        }
        document.getElementById('paymentModal').classList.add('active');
    }

    closePaymentModal() {
        document.getElementById('paymentModal').classList.remove('active');
    }

    async processPayment(method) {
        this.closePaymentModal();
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
        const tax = (subtotal * taxPercent) / 100;
        const total = subtotal + tax;

        try {
            // Process payment
            const paymentRecord = paymentProcessor.processPayment(total, method);
            
            // Prepare bill data
            const billData = {
                billId: this.billNumber,
                billNumber: this.billNumber,
                amount: total,
                subtotal: subtotal,
                tax: tax,
                taxPercent: taxPercent,
                paymentMethod: method,
                items: this.cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity
                })),
                date: new Date().toISOString()
            };

            // Save bill to Supabase (optional)
            // await supabase.saveBill(billData);

            // Show success modal with QR code
            this.showSuccessModal(billData);

        } catch (error) {
            console.error('Payment error:', error);
            this.showAlert('Payment processing failed', 'danger');
        }
    }

    showSuccessModal(billData) {
        const qrUrl = QRCodeGenerator.generateBillQR(billData);
        
        document.getElementById('successBillNumber').textContent = billData.billId;
        document.getElementById('successAmount').textContent = billData.amount.toFixed(2);
        document.getElementById('successMethod').textContent = billData.paymentMethod;
        document.getElementById('successTime').textContent = new Date(billData.date).toLocaleString('en-IN');
        
        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.innerHTML = '';
        const img = new Image();
        img.src = qrUrl;
        img.alt = 'Bill QR Code';
        img.style.cssText = 'width: 150px; height: 150px; margin: 0 auto;';
        qrContainer.appendChild(img);
        
        document.getElementById('successModal').classList.add('active');
    }

    completePayment() {
        document.getElementById('successModal').classList.remove('active');
        
        // Save to local storage for history
        const billHistory = JSON.parse(localStorage.getItem('scannerBillHistory') || '[]');
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
        const tax = (subtotal * taxPercent) / 100;
        const total = subtotal + tax;
        
        billHistory.push({
            billNumber: this.billNumber,
            total: total,
            items: this.cart.length,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('scannerBillHistory', JSON.stringify(billHistory));
        
        // Clear bill
        this.clearBill();
        
        this.showAlert('Bill saved successfully!', 'success');
    }

    clearBill() {
        this.cart = [];
        this.recentScans = [];
        this.billNumber = this.generateBillNumber();
        document.getElementById('taxPercent').value = '0';
        this.updateBill();
        this.updateDateTime();
        this.displayRecentScans();
        this.showAlert('Bill cleared', 'info');
        document.getElementById('barcodeInput').focus();
    }
}

// Initialize Scanner App
let scannerApp;
document.addEventListener('DOMContentLoaded', () => {
    scannerApp = new ScannerApp();
});
