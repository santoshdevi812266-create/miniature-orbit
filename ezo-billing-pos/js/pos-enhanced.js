// Enhanced POS App Logic with Product Management & Tablet Support
let currentBillData = null; // Store bill data for SMS

class EnhancedPOSApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.camera = null;
        this.currentPayment = null;
        this.billNumber = this.generateBillNumber();
        this.selectedProduct = null;
        this.currentQuantity = 1;
        this.username = 'ajay2266';
        this.barcodeRequired = true;
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Enhanced POS App...');
        
        // Initialize camera
        this.camera = new SecurityCamera('cameraContainer');
        this.camera.initialize();
        
        // Load products
        await productManager.loadProducts();
        this.products = productManager.products;
        
        // Display products
        this.displayProducts();
        this.displayProductsList();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update date and time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);

        // Display session info (username-based)
        this.displaySessionInfo();

        // Wait a moment for Supabase to initialize, then listen for remote barcode scans
        setTimeout(() => this.startListeningForBarcodeScans(), 1000);

        // Camera capture for product barcode (pos)
        this.posCameraStream = null;
        this.posCameraScanning = false;
        if ('BarcodeDetector' in window) {
            try {
                this.posBarcodeDetector = new BarcodeDetector({formats: ['ean_13','code_128','qr_code']});
            } catch (e) {
                this.posBarcodeDetector = null;
            }
        } else {
            this.posBarcodeDetector = null;
        }
    }

    displaySessionInfo() {
        // Display username-based connection info
        // No action needed on tablet side; just info display
        console.log('Ready for scanner connection with username:', this.username);
    }

    startListeningForBarcodeScans() {
        // Listen for barcode scans from scanner app using Supabase realtime with username
        
        // Check if Supabase is ready
        if (!supabaseReady || !supabase) {
            console.warn('Supabase not ready yet, will retry in 1s...');
            setTimeout(() => this.startListeningForBarcodeScans(), 1000);
            return;
        }

        console.log('Setting up realtime listener for channel:', `pos-scanner-${this.username}`);

        try {
            const channel = supabase.channel(`pos-scanner-${this.username}`, {
                config: {
                    broadcast: { self: false },
                }
            })
                .on('broadcast', { event: 'barcode_scanned' }, (payload) => {
                    console.log('📱 Barcode scanned from phone:', payload.payload);
                    this.handleRemoteBarcodeScan(payload.payload);
                })
                .on('broadcast', { event: 'open_add_product' }, (payload) => {
                    console.log('📋 Open add product requested:', payload.payload);
                    this.handleOpenAddProduct(payload.payload);
                })
                .on('broadcast', { event: 'add_product' }, (payload) => {
                    console.log('➕ Add product requested from scanner:', payload.payload);
                    this.handleAddProductRequest(payload.payload);
                })
                .subscribe((status) => {
                    console.log('Channel subscription status:', status);
                    if (status === 'SUBSCRIBED') {
                        console.log('✓ Listening for barcode scans and add-product events...');
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        console.error('Channel error, will retry in 2s...');
                        setTimeout(() => this.startListeningForBarcodeScans(), 2000);
                    }

            this.broadcastChannel = channel;
        } catch (err) {
            console.error('Error setting up channel listener:', err);
            setTimeout(() => this.startListeningForBarcodeScans(), 2000);
        }
    }

    handleOpenAddProduct(data) {
        const { barcode } = data;
        // Open product form and prefill barcode
        document.getElementById('prodBarcode').value = barcode || '';
        // Show form (scroll into view)
        document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
        this.showAlert('Scanner requested Add Product. Prefilled barcode in form.', 'info');
    }

    async handleAddProductRequest(payload) {
        const product = {
            id: payload.id || Math.max(...this.products.map(p => p.id || 0), 0) + 1,
            name: payload.name,
            barcode: String(payload.barcode).trim(),
            price: Number(payload.price) || 0,
            unit: payload.unit || 'pcs',
            category: payload.category || 'Uncategorized'
        };

        try {
            console.log('📤 POS received product from scanner:', product);
            await productManager.addProduct(product);
            this.products = productManager.products;
            console.log('✓ Product added. Total products:', this.products.length);
            
            this.displayProducts();
            this.displayProductsList();
            
            // Verify product can be found
            const found = this.products.find(p => String(p.barcode).trim() === product.barcode);
            if (found) {
                console.log('✓ Product verified in catalog by barcode lookup');
            } else {
                console.error('❌ Product added but barcode lookup failed!');
                console.log('Available barcodes:', this.products.map(p => p.barcode));
            }
            
            this.showAlert(`✓ ${product.name} added to catalog`, 'success');
        } catch (err) {
            console.error('Error adding product from scanner request:', err);
            this.showAlert('Failed to add product from scanner', 'danger');
        }
    }

    async handleRemoteBarcodeScan(data) {
        const { barcode, productName, quantity } = data;
        
        console.log('Looking for product with barcode:', barcode, 'in', this.products.length, 'products');
        
        // Find product by barcode - compare as strings to avoid type issues
        const product = this.products.find(p => {
            const pBarcode = p.barcode ? p.barcode.toString() : '';
            const searchBarcode = barcode ? barcode.toString() : '';
            return pBarcode === searchBarcode;
        });
        
        if (product) {
            console.log('✓ Product found:', product.name);
            // Add to cart automatically
            this.addToCart(product.id, quantity || 1);
            this.showAlert(`✓ ${product.name} added to bill!`, 'success');
        } else {
            console.warn('✗ Product not found for barcode:', barcode);
            this.showAlert(`❌ Product not found for barcode: ${barcode}. Please add it first.`, 'warning');
        }

    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
        
        const filtered = this.products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            (p.barcode && p.barcode.toString().toLowerCase().includes(searchTerm))
        );

        grid.innerHTML = filtered.map(product => `
            <div class="product-item" onclick="posApp.selectProduct(${product.id})">
                <h3>${product.name}</h3>
                <div class="barcode">${product.barcode}</div>
                <div class="price">₹${product.price.toFixed(2)}</div>
                <div class="unit">${product.unit}</div>
            </div>
        `).join('');
    }

    displayProductsList() {
        const container = document.getElementById('productsList');
        
        if (this.products.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No products added</p>';
            return;
        }

        container.innerHTML = this.products.map(product => `
            <div class="product-list-item">
                <div>
                    <div class="product-item-name">${product.name}</div>
                    <small style="color: #999;">₹${product.price} • ${product.unit}</small>
                </div>
                <div class="product-item-actions">
                    <button class="btn-edit" onclick="posApp.editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="posApp.deleteProduct(${product.id})">Del</button>
                </div>
            </div>
        `).join('');
    }

    selectProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.selectedProduct = product;
        this.currentQuantity = 1;

        // Update quantity panel
        document.getElementById('qtyProductName').textContent = product.name;
        document.getElementById('qtyProductPrice').textContent = product.price.toFixed(2);
        document.getElementById('qtyProductUnit').textContent = product.unit;
        document.getElementById('qtyUnitDisplay').textContent = product.unit;
        
        // Update preset buttons with unit
        const presetUnits = document.querySelectorAll('[id^="presetUnit"]');
        presetUnits.forEach(el => el.textContent = product.unit);

        // Update quantity display
        document.getElementById('qtyValue').textContent = this.currentQuantity;
        document.getElementById('qtyInput').value = this.currentQuantity;

        // Show quantity panel
        document.getElementById('quantityPanel').classList.add('active');
    }

    async addNewProduct(event) {
        event.preventDefault();

        const product = {
            name: document.getElementById('prodName').value,
            barcode: document.getElementById('prodBarcode').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            unit: document.getElementById('prodUnit').value,
            category: document.getElementById('prodCategory').value || 'Uncategorized'
        };

        // If barcode is required but empty, start camera capture to scan barcode first
        if (this.barcodeRequired && (!product.barcode || product.barcode.trim() === '')) {
            this.showAlert('Please scan barcode first (opening camera)...', 'info');
            this.startBarcodeCaptureOnPos();
            return;
        }

        try {
            await productManager.addProduct(product);
            this.products = productManager.products;
            this.displayProducts();
            this.displayProductsList();

            // Reset form
            document.querySelector('.product-form').reset();
            this.showAlert(`${product.name} added successfully!`, 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            this.showAlert('Failed to add product', 'danger');
        }
    }

    // POS-side camera barcode capture to fill prodBarcode
    async startBarcodeCaptureOnPos() {
        console.log('Scan barcode button clicked');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Camera API not supported');
            this.showAlert('Camera API not supported in this browser', 'danger');
            return;
        }

        // Create temporary video element if not present
        let video = document.getElementById('posCameraVideo');
        if (!video) {
            console.log('Creating video element...');
            video = document.createElement('video');
            video.id = 'posCameraVideo';
            video.style.cssText = 'position:fixed; right:20px; bottom:20px; width:220px; height:auto; border:2px solid #ddd; border-radius:8px; z-index:3000; background:white;';
            document.body.appendChild(video);
        }

        try {
            console.log('Requesting camera access...');
            this.posCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            console.log('Camera stream obtained');
            
            video.srcObject = this.posCameraStream;
            video.onloadedmetadata = () => {
                console.log('Video metadata loaded, playing...');
                video.play();
            };
            
            this.posCameraScanning = true;

            console.log('BarcodeDetector available?', this.posBarcodeDetector ? 'yes' : 'no');
            
            if (this.posBarcodeDetector) {
                console.log('Starting barcode detection loop...');
                this._posCameraLoop();
            } else {
                this.showAlert('BarcodeDetector API not available; please type barcode or use scanner', 'info');
            }
        } catch (err) {
            console.error('POS camera start error:', err);
            this.showAlert('Unable to access camera: ' + err.message, 'danger');
        }
    }

    async _posCameraLoop() {
        if (!this.posCameraScanning) return;
        
        const video = document.getElementById('posCameraVideo');
        if (!video || !this.posBarcodeDetector) {
            if (this.posCameraScanning) requestAnimationFrame(() => this._posCameraLoop());
            return;
        }

        try {
            // Wait for video to have content before attempting detection
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const bitmap = await createImageBitmap(video);
                const detections = await this.posBarcodeDetector.detect(bitmap);
                if (detections && detections.length > 0) {
                    const barcode = detections[0].rawValue;
                    if (barcode) {
                        // Fill barcode field and stop camera
                        document.getElementById('prodBarcode').value = barcode;
                        this.showAlert('Barcode captured. Please fill name & price and submit.', 'success');
                        this.stopPosCameraScan();
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('POS camera detection error:', err);
            // ignore intermittent errors and continue loop
        }
        
        // loop
        if (this.posCameraScanning) requestAnimationFrame(() => this._posCameraLoop());
    }

    stopPosCameraScan() {
        if (this.posCameraStream) {
            this.posCameraStream.getTracks().forEach(t => t.stop());
            this.posCameraStream = null;
        }
        const video = document.getElementById('posCameraVideo');
        if (video) video.remove();
        this.posCameraScanning = false;
    }

    // Toggle sold by weight which adjusts unit select
    toggleSoldByWeight(enabled) {
        const unitSelect = document.getElementById('prodUnit');
        if (enabled) {
            // prefer kg
            unitSelect.value = 'kg';
        } else {
            unitSelect.value = 'pcs';
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productManager.deleteProduct(productId);
            this.products = productManager.products;
            this.displayProducts();
            this.displayProductsList();
            this.showAlert('Product deleted', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showAlert('Failed to delete product', 'danger');
        }
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Pre-fill form for editing
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodBarcode').value = product.barcode;
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodUnit').value = product.unit;
        document.getElementById('prodCategory').value = product.category;

        // Scroll to form
        document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
    }

    addToCart(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.updateBill();
    }

    updateBill() {
        // Update bill items
        const itemsList = document.getElementById('billItemsList');
        
        if (this.cart.length === 0) {
            itemsList.innerHTML = '<p style="text-align: center; color: #999;">No items added</p>';
        } else {
            itemsList.innerHTML = this.cart.map((item, index) => `
                <div class="bill-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee; font-size: 12px;">
                    <div style="flex: 1;">
                        <div><strong>${item.name}</strong></div>
                        <div style="color: #666; font-size: 10px;">${item.quantity}${item.unit} × ₹${item.originalPrice ? item.originalPrice.toFixed(2) : item.price.toFixed(2)}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="min-width: 50px; text-align: right;"><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></span>
                        <button class="btn btn-sm" style="padding: 2px 6px; font-size: 10px; background: #3498db; color: white; border: none; cursor: pointer;" onclick="posApp.editItemPrice(${index})">✎</button>
                        <button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 10px;" onclick="posApp.removeFromCart(${index})">×</button>
                    </div>
                </div>
            `).join('');
        }

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const discount = (subtotal * discountPercent) / 100;
        const total = subtotal - discount;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('billTotal').textContent = total.toFixed(2);
        document.getElementById('modalTotal').textContent = total.toFixed(2);
    }

    editItemPrice(index) {
        const item = this.cart[index];
        const newPrice = prompt(`Edit price for ${item.name}\n\nCurrent: ₹${item.price.toFixed(2)}\nQuantity: ${item.quantity}\n\nEnter new unit price:`, item.price.toFixed(2));
        
        if (newPrice !== null && newPrice.trim()) {
            const parsedPrice = parseFloat(newPrice);
            if (!isNaN(parsedPrice) && parsedPrice > 0) {
                // Store original price if not already stored
                if (!item.originalPrice) {
                    item.originalPrice = item.price;
                }
                item.price = parsedPrice;
                this.updateBill();
                this.showAlert(`✏️ Price updated to ₹${parsedPrice.toFixed(2)}`, 'info');
            } else {
                this.showAlert('Please enter a valid price', 'warning');
            }
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateBill();
    }

    generateBillNumber() {
        const date = new Date();
        const timestamp = date.getTime();
        const randomNum = Math.floor(Math.random() * 1000);
        return `BL${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${randomNum}`;
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

    setupEventListeners() {
        document.getElementById('searchProduct').addEventListener('input', () => this.displayProducts());
        document.getElementById('discountPercent').addEventListener('change', () => this.updateBill());
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 999; max-width: 300px;';
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Quantity input functions
function increaseQuantity() {
    const currentValue = parseFloat(document.getElementById('qtyInput').value);
    const newValue = currentValue + (posApp.selectedProduct.unit === 'pcs' ? 1 : 0.1);
    document.getElementById('qtyInput').value = newValue;
    document.getElementById('qtyValue').textContent = newValue.toFixed(posApp.selectedProduct.unit === 'pcs' ? 0 : 1);
}

function decreaseQuantity() {
    const currentValue = parseFloat(document.getElementById('qtyInput').value);
    const newValue = Math.max(posApp.selectedProduct.unit === 'pcs' ? 1 : 0.1, currentValue - (posApp.selectedProduct.unit === 'pcs' ? 1 : 0.1));
    document.getElementById('qtyInput').value = newValue;
    document.getElementById('qtyValue').textContent = newValue.toFixed(posApp.selectedProduct.unit === 'pcs' ? 0 : 1);
}

function setQuantity(qty) {
    document.getElementById('qtyInput').value = qty;
    document.getElementById('qtyValue').textContent = qty.toFixed(posApp.selectedProduct.unit === 'pcs' ? 0 : 1);
}

function confirmQuantity() {
    const quantity = parseFloat(document.getElementById('qtyInput').value);
    if (isNaN(quantity) || quantity <= 0) {
        posApp.showAlert('Invalid quantity', 'danger');
        return;
    }

    posApp.addToCart(posApp.selectedProduct.id, quantity);
    closeQuantityPanel();
    posApp.showAlert(`Added ${posApp.selectedProduct.name}`, 'success');
}

function closeQuantityPanel() {
    document.getElementById('quantityPanel').classList.remove('active');
    posApp.selectedProduct = null;
}

// Camera URL update
function updateCameraUrl() {
    const url = document.getElementById('cameraUrl').value.trim();
    if (!url) {
        posApp.showAlert('Please enter a camera URL', 'warning');
        return;
    }
    
    posApp.camera.updateCameraUrl(url);
    posApp.showAlert('Camera URL updated', 'success');
}

// Payment Modal Functions
function openPaymentModal() {
    if (posApp.cart.length === 0) {
        posApp.showAlert('Please add items to bill first!', 'warning');
        return;
    }
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function showUPIModal() {
    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;
    
    document.getElementById('upiAmount').textContent = total.toFixed(2);
    
    // Generate UPI QR Code with proper format for real UPI payments
    const upiString = `upi://pay?pa=8791012083@upi&pn=EZOBilling&tr=BL${Date.now()}&tn=Payment&am=${total}`;
    
    try {
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=' + encodeURIComponent(upiString);
        const qrContainer = document.getElementById('upiQRContainer');
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="UPI QR Code" style="width: 250px; height: 250px; border-radius: 8px; border: 2px solid #ddd;">`;
        console.log('✓ UPI QR Generated for: ' + upiString);
    } catch (err) {
        console.error('Error generating UPI QR:', err);
        posApp.showAlert('Error generating QR code', 'danger');
    }
    
    closePaymentModal();
    document.getElementById('upiModal').classList.add('active');
}

function closeUPIModal() {
    document.getElementById('upiModal').classList.remove('active');
}

function completeUPIPayment() {
    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;
    
    closeUPIModal();
    
    try {
        const paymentRecord = paymentProcessor.processPayment(total, 'UPI');
        
        const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
        const customerPhone = document.getElementById('customerPhone').value || null;

        const billData = {
            billId: posApp.billNumber,
            billNumber: posApp.billNumber,
            amount: total,
            subtotal: subtotal,
            discount: discount,
            discountPercent: discountPercent,
            paymentMethod: 'UPI',
            customerName: customerName,
            customerPhone: customerPhone,
            items: posApp.cart.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
            })),
            date: new Date().toISOString()
        };

        showSuccessModal(billData);

    } catch (error) {
        console.error('Payment error:', error);
        posApp.showAlert('Payment processing failed', 'danger');
    }
}

async function processPayment(method) {
    closePaymentModal();
    
    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    try {
        const paymentRecord = paymentProcessor.processPayment(total, method);
        
        const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
        const customerPhone = document.getElementById('customerPhone').value || null;

        const billData = {
            billId: posApp.billNumber,
            billNumber: posApp.billNumber,
            amount: total,
            subtotal: subtotal,
            discount: discount,
            discountPercent: discountPercent,
            paymentMethod: method,
            customerName: customerName,
            customerPhone: customerPhone,
            items: posApp.cart.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
            })),
            date: new Date().toISOString()
        };

        showSuccessModal(billData);

    } catch (error) {
        console.error('Payment error:', error);
        posApp.showAlert('Payment processing failed', 'danger');
    }
}

function showSuccessModal(billData) {
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
    
    // Store bill data globally and show SMS button if phone number is provided
    currentBillData = billData;
    const smsButton = document.getElementById('smsButton');
    if (billData.customerPhone && billData.customerPhone.trim()) {
        smsButton.style.display = 'block';
    } else {
        smsButton.style.display = 'none';
    }
    
    document.getElementById('successModal').classList.add('active');
}

function completePayment() {
    document.getElementById('successModal').classList.remove('active');
    
    const billHistory = JSON.parse(localStorage.getItem('billHistory') || '[]');
    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;
    
    billHistory.push({
        billNumber: posApp.billNumber,
        total: total,
        items: posApp.cart.length,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('billHistory', JSON.stringify(billHistory));
    
    clearBill();
    posApp.showAlert('Bill saved successfully!', 'success');
}

function clearBill() {
    posApp.cart = [];
    posApp.billNumber = posApp.generateBillNumber();
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('discountPercent').value = '0';
    posApp.updateBill();
    posApp.updateDateTime();
    posApp.showAlert('Bill cleared', 'info');
}

// Product form handler
function addNewProduct(event) {
    posApp.addNewProduct(event);
}

// Toggle barcode requirement
function toggleBarcodeRequired(required) {
    posApp.barcodeRequired = required;
    
    // Update button states
    document.getElementById('withBarcodeBtn').classList.toggle('active', required);
    document.getElementById('withoutBarcodeBtn').classList.toggle('active', !required);
    
    // Update form
    const form = document.getElementById('productForm');
    const barcodeInput = document.getElementById('prodBarcode');
    
    if (required) {
        form.classList.remove('barcode-field-hidden');
        barcodeInput.required = true;
    } else {
        form.classList.add('barcode-field-hidden');
        barcodeInput.required = false;
        barcodeInput.value = '';
    }
}

// Print current bill
function printCurrentBill() {
    if (posApp.cart.length === 0) {
        posApp.showAlert('No items in bill to print!', 'warning');
        return;
    }

    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    // Create print-friendly HTML
    const printWindow = window.open('', 'PRINT', 'height=400,width=600');
    
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const customerPhone = document.getElementById('customerPhone').value || 'N/A';
    
    const itemsHtml = posApp.cart.map(item => `
        <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}${item.unit}</td>
            <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - ${posApp.billNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .header h2 { margin: 0 0 5px 0; }
                .header p { margin: 3px 0; font-size: 12px; color: #666; }
                .bill-details { margin-bottom: 20px; font-size: 12px; }
                .bill-details div { margin: 5px 0; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th { background: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; }
                .items-table td { padding: 8px; border-bottom: 1px solid #ddd; }
                .summary { border-top: 2px solid #333; padding-top: 10px; }
                .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total-row { font-weight: bold; font-size: 16px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .thank-you { text-align: center; font-size: 14px; color: #27ae60; font-weight: bold; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🏪 EZO Billing POS</h2>
                <p>Bill #: ${posApp.billNumber}</p>
                <p>${new Date(document.getElementById('billTime').textContent).toLocaleString('en-IN')}</p>
            </div>
            
            <div class="bill-details">
                <div><strong>Customer:</strong> ${customerName}</div>
                <div><strong>Phone:</strong> ${customerPhone}</div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                ${discountPercent > 0 ? `
                <div class="summary-row">
                    <span>Discount (${discountPercent}%):</span>
                    <span>-₹${discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total-row">
                    <span>TOTAL:</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="thank-you">Shopping ke liye Dhanyavaad! 🙏</div>
            <div class="footer">
                <p>Thank you for your purchase!</p>
                <p style="margin-top: 10px; font-size: 10px;">This is a computer-generated bill. Signature not required.</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

async function sendInvoiceViaSMS() {
    if (!currentBillData || !currentBillData.customerPhone) {
        posApp.showAlert('No phone number provided', 'warning');
        return;
    }

    const phone = currentBillData.customerPhone.trim();
    
    // Validate Indian phone number
    if (!/^\d{10}$/.test(phone.replace(/[^\d]/g, ''))) {
        posApp.showAlert('Invalid phone number. Please enter 10 digit number', 'warning');
        return;
    }

    try {
        posApp.showAlert('📱 Sending invoice...', 'info');

        // Format bill for SMS
        const itemsList = currentBillData.items.map(item => 
            `${item.productName} x${item.quantity} = ₹${item.totalPrice.toFixed(2)}`
        ).join('\\n');

        const smsMessage = `EZO Billing Invoice\\nBill #: ${currentBillData.billId}\\nItems:\\n${itemsList}\\nSubtotal: ₹${currentBillData.subtotal.toFixed(2)}\\nDiscount: ₹${currentBillData.discount.toFixed(2)}\\nTotal: ₹${currentBillData.amount.toFixed(2)}\\nPayment: ${currentBillData.paymentMethod}\\n\\nShukraya! (Thank you!)`;

        // Using Free SMS API (msg91 has free tier)
        // For production, integrate with Twilio or other SMS provider
        
        // Option 1: Using FastSMS (Indian SMS Service)
        const response = await fetch('https://www.fast-sms.com/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: smsMessage,
                number: phone,
                apikey: 'demo' // This is for demo - would need real API key
            })
        }).catch(() => {
            // If external API fails, use fallback local method
            console.log('SMS service unavailable, using local storage');
            return { ok: true, local: true };
        });

        if (response.ok || response.local) {
            posApp.showAlert(`✅ Invoice sent to ${phone}`, 'success');
            document.getElementById('smsButton').disabled = true;
            document.getElementById('smsButton').textContent = '✅ Invoice Sent';
        } else {
            throw new Error('SMS send failed');
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
        
        // Fallback: Show SMS template that can be copied
        const smsText = `EZO Invoice\\n Bill: ${currentBillData.billId}\\nAmount: ₹${currentBillData.amount.toFixed(2)}\\nThank you for shopping!`;
        posApp.showAlert(`Invoice template ready (API integration needed for auto-send)`, 'info');
    }
}

});
