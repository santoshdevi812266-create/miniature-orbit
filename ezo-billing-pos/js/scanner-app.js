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
        // Debounce settings to prevent duplicate scans
        this.lastScanTime = 0;
        this.scanDebounceDelay = 500; // milliseconds - prevent duplicate within 500ms
        this.isProcessingScan = false;
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
                // Support multiple barcode formats for better accuracy
                this.barcodeDetector = new BarcodeDetector({
                    formats: [
                        'ean_13',      // Standard retail barcodes
                        'code_128',    // Universal barcode format
                        'code_39',     // Industrial barcodes
                        'code_93',     // Compact format
                        'ean_8',       // Shorter EAN format
                        'upc_a',       // UPC-A (retail)
                        'upc_e',       // UPC-E (retail compact)
                        'qr_code'      // QR codes
                    ]
                });
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

    // Beep sound when barcode is scanned
    beep(frequency = 800, duration = 100) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Beep not supported:', e);
        }
    }

    async connectWithUsername() {
        console.log('Connect button clicked');
        
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();
        console.log('Username input:', username);

        if (!username) {
            this.showAlert('Please enter a username', 'warning');
            return;
        }

        this.showAlert('🔄 Connecting...', 'info');
        
        // Wait for Supabase to be ready
        if (!supabaseReady || !supabase) {
            console.log('Waiting for Supabase initialization...');
            try {
                await window.supabaseClient.init();
            } catch (err) {
                console.error('Failed to initialize Supabase:', err);
            }
        }

        // Final check
        if (!supabaseReady || !supabase) {
            this.showAlert('❌ Failed to connect to server', 'danger');
            console.error('Supabase still not ready:', { supabaseReady, hasSupabase: !!supabase });
            return;
        }

        this.username = username;

        // Setup Supabase realtime channel using username
        try {
            this.broadcastChannel = supabase
                .channel(`pos-scanner-${username}`, {
                    config: {
                        broadcast: { self: false },
                    }
                })
                .on('broadcast', { event: 'add_product' }, (payload) => {
                    console.log('Add product confirmed from POS:', payload);
                })
                .subscribe((status) => {
                    console.log('Channel subscription status:', status);
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
        } catch (err) {
            console.error('Error setting up channel:', err);
            this.showAlert('Error connecting to POS', 'danger');
        }
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
            console.log('Loading products in Scanner App...');
            
            // Use product manager to load products
            if (typeof productManager !== 'undefined') {
                await productManager.loadProducts();
                this.products = productManager.products;
                console.log('✓ Loaded', this.products.length, 'products from product manager');
            } else {
                // Fallback to local products if product manager not available
                this.products = [
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
                console.log('Using fallback products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            // Use fallback products
            this.products = [
                { id: 1, name: 'Rice (1kg)', barcode: '1001', price: 50, unit: 'kg', category: 'Grains' },
                { id: 2, name: 'Wheat (1kg)', barcode: '1002', price: 45, unit: 'kg', category: 'Grains' },
                { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 55, unit: 'kg', category: 'Grains' },
                { id: 4, name: 'Salt (500g)', barcode: '1004', price: 15, unit: 'g', category: 'Spices' },
                { id: 5, name: 'Oil (1L)', barcode: '1005', price: 120, unit: 'L', category: 'Oils' }
            ];
            console.warn('Using fallback products due to error');
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
        // Debounce: prevent duplicate scans within 500ms
        const now = Date.now();
        if (now - this.lastScanTime < this.scanDebounceDelay || this.isProcessingScan) {
            console.log('🚫 Duplicate scan ignored (debounced)');
            return;
        }
        
        this.isProcessingScan = true;
        this.lastScanTime = now;
        
        // Beep on successful scan
        this.beep(800, 100);
        
        this.totalScans++;
        this.updateStats();
        
        console.log('✓ Barcode scanned:', barcode);
        console.log('📦 Total products available:', this.products.length);
        
        // Find product by barcode - compare as strings
        const product = this.products.find(p => {
            const pBarcode = p.barcode ? p.barcode.toString() : '';
            const searchBarcode = barcode ? barcode.toString() : '';
            return pBarcode === searchBarcode;
        });

        // If scanner-only mode is enabled and connected, broadcast immediately
        const scannerOnly = document.getElementById('scannerOnlyMode') && document.getElementById('scannerOnlyMode').checked;
        if (scannerOnly && this.isConnected && this.broadcastChannel) {
            // If product exists locally, send product info; otherwise send barcode only
            const qty = 1;
            if (product) {
                console.log('✓ Product found in scanner-only mode:', product.name);
                this.broadcastBarcodeToMainPOS(product, qty);
                this.addToRecentScans(product);
                this.beep(1000, 150); // Higher beep for success
            } else {
                console.log('⚠️ Product not found - opening add form instead of broadcasting');
                this.openAddProductModal(barcode);
            }

            // reset input and UI
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcodeInput').focus();
            this.isProcessingScan = false;
            return;
        }

        // Legacy behavior: show product info and allow manual add
        const notFoundDiv = document.getElementById('productNotFound');
        const infoDiv = document.getElementById('scannedProductInfo');

        if (!product) {
            console.log('⚠️ Product not found - opening add product modal');
            notFoundDiv.style.display = 'block';
            infoDiv.style.display = 'none';

            // Open the add product modal directly
            this.openAddProductModal(barcode);
            
            // reset input
            document.getElementById('barcodeInput').value = '';
            document.getElementById('barcodeInput').focus();
            this.isProcessingScan = false;
            return;
        }

        // Product found - show info
        console.log('✓ Product found:', product.name);
        this.beep(1000, 150); // Higher beep for success
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
    // Open add product modal with prefilled barcode
    openAddProductModal(barcode) {
        console.log('📋 Opening add product modal for barcode:', barcode);
        
        // Prefill the barcode field
        document.getElementById('prodBarcodeScan').value = barcode;
        document.getElementById('prodNameScan').value = '';
        document.getElementById('prodPriceScan').value = '';
        document.getElementById('prodUnitScan').value = 'pcs';
        document.getElementById('prodCategoryScan').value = '';
        
        // Show the modal and overlay
        document.getElementById('addProductOverlay').style.display = 'block';
        const addPanel = document.getElementById('addProductPanel');
        if (addPanel) {
            addPanel.style.display = 'block';
            console.log('✓ Add product modal opened');
            
            // Focus on name field for easy input
            setTimeout(() => {
                document.getElementById('prodNameScan').focus();
            }, 100);
            
            // Show helpful message
            this.showAlert('Product not found! Add it directly below 👇', 'info');
        } else {
            console.error('❌ Add product panel not found!');
        }
    }

    // Close add product modal
    closeAddProductModal() {
        console.log('Closing add product modal');
        document.getElementById('addProductPanel').style.display = 'none';
        document.getElementById('addProductOverlay').style.display = 'none';
        document.getElementById('barcodeInput').value = '';
        document.getElementById('barcodeInput').focus();
        this.isProcessingScan = false;
    }

    // Add product locally (to scanner app and optionally broadcast to POS)
    async addProductLocally() {
        const barcode = document.getElementById('prodBarcodeScan').value.trim();
        const name = document.getElementById('prodNameScan').value.trim();
        const price = parseFloat(document.getElementById('prodPriceScan').value) || 0;
        const unit = document.getElementById('prodUnitScan').value;
        const category = document.getElementById('prodCategoryScan').value || 'Uncategorized';

        if (!name) {
            this.showAlert('Please enter product name', 'warning');
            return;
        }

        if (price <= 0) {
            this.showAlert('Please enter valid price', 'warning');
            return;
        }

        // Add to local products array
        const newProduct = {
            id: Math.max(...this.products.map(p => p.id || 0), 0) + 1,
            barcode,
            name,
            price,
            unit,
            category
        };

        this.products.push(newProduct);
        console.log('✓ Product added locally:', newProduct.name);

        // Broadcast to main POS if connected
        if (this.isConnected && this.broadcastChannel) {
            try {
                await this.broadcastChannel.send({
                    type: 'broadcast',
                    event: 'add_product',
                    payload: newProduct
                });
                console.log('✓ Product broadcasted to main POS');
            } catch (err) {
                console.error('Error broadcasting product:', err);
            }
        }

        // Show success
        this.beep(1000, 200); // Success beep
        this.showAlert(`✓ ${name} added successfully!`, 'success');

        // Close modal and reset
        this.closeAddProductModal();
    }

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
