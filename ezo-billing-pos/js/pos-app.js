// POS App Main Logic
class POSApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.camera = null;
        this.currentPayment = null;
        this.billNumber = this.generateBillNumber();
        this.initialize();
    }

    async initialize() {
        console.log('Initializing POS App...');
        
        // Initialize camera
        this.camera = new CameraPreview('cameraContainer');
        await this.camera.initialize();
        
        // Load products
        await this.loadProducts();
        
        // Display products
        this.displayProducts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update date and time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
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
                { id: 8, name: 'Butter (200g)', barcode: '8901234567897', price: 120, unit: 'g', category: 'Dairy' }
            ];
            console.log('Products loaded:', this.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Error loading products', 'danger');
        }
    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
        
        const filtered = this.products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.barcode.includes(searchTerm)
        );

        grid.innerHTML = filtered.map(product => `
            <div class="product-item" onclick="posApp.addToCart(${product.id})">
                <h3>${product.name}</h3>
                <div class="barcode">${product.barcode}</div>
                <div class="price">₹${product.price.toFixed(2)}</div>
                <div class="unit">${product.unit}</div>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Show quantity input
        const quantity = prompt(`Enter quantity for ${product.name} (${product.unit}):`, '1');
        if (quantity === null || isNaN(quantity) || quantity <= 0) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += parseFloat(quantity);
        } else {
            this.cart.push({
                ...product,
                quantity: parseFloat(quantity)
            });
        }

        this.updateBill();
        this.showAlert(`Added ${product.name}`, 'success');
    }

    updateBill() {
        // Update bill items
        const itemsList = document.getElementById('billItemsList');
        
        if (this.cart.length === 0) {
            itemsList.innerHTML = '<p style="text-align: center; color: #999;">No items added</p>';
        } else {
            itemsList.innerHTML = this.cart.map((item, index) => `
                <div class="bill-item">
                    <span>${item.name}</span>
                    <span>${item.quantity}${item.unit}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 10px;" onclick="posApp.removeFromCart(${index})">×</button>
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

// Global functions for payment modal
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

async function processPayment(method) {
    closePaymentModal();
    
    const subtotal = posApp.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    try {
        // Process payment
        const paymentRecord = paymentProcessor.processPayment(total, method);
        
        // Prepare bill data
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

        // Save bill to Supabase (optional)
        // await supabase.saveBill(billData);

        // Show success modal with QR code
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
    
    document.getElementById('successModal').classList.add('active');
}

function completePayment() {
    document.getElementById('successModal').classList.remove('active');
    
    // Save to local storage for history
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
    
    // Clear bill
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

// Initialize POS App
let posApp;
document.addEventListener('DOMContentLoaded', () => {
    posApp = new POSApp();
});
