// API Integration Examples and Utilities

// ====================================
// RAZORPAY PAYMENT INTEGRATION
// ====================================

class RazorpayIntegration {
    constructor(keyId) {
        this.keyId = keyId;
    }

    async initiatePayment(amount, orderId, customerEmail, customerPhone) {
        try {
            const options = {
                key: this.keyId,
                amount: amount * 100, // Amount in paise
                currency: "INR",
                name: "EZO Billing",
                description: "Store Purchase",
                order_id: orderId,
                handler: this.handlePaymentSuccess.bind(this),
                prefill: {
                    email: customerEmail,
                    contact: customerPhone
                },
                theme: {
                    color: "#0f3460"
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Razorpay error:', error);
            throw error;
        }
    }

    handlePaymentSuccess(response) {
        console.log('Payment successful:', response);
        return {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            status: 'success'
        };
    }
}

// Usage in payment.js:
/*
async processOnlinePayment(amount, customerEmail, customerPhone) {
    const razorpay = new RazorpayIntegration('YOUR_RAZORPAY_KEY_ID');
    return razorpay.initiatePayment(amount, 'ORDER_ID', customerEmail, customerPhone);
}
*/

// ====================================
// TWILIO SMS NOTIFICATION
// ====================================

class TwilioSMSNotification {
    constructor(twilioApiUrl, authToken) {
        this.apiUrl = twilioApiUrl;
        this.authToken = authToken;
    }

    async sendBillSMS(phoneNumber, billData) {
        try {
            const message = `
Thank you for your purchase!
Bill: ${billData.billId}
Amount: ₹${billData.amount}
Payment: ${billData.paymentMethod}
Time: ${new Date(billData.date).toLocaleTimeString()}
            `;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa('AccountSID:' + this.authToken)}`
                },
                body: `From=+1234567890&To=+91${phoneNumber}&Body=${encodeURIComponent(message)}`
            });

            return await response.json();
        } catch (error) {
            console.error('SMS sending error:', error);
        }
    }
}

// ====================================
// EMAIL NOTIFICATION
// ====================================

class EmailNotification {
    constructor(emailServiceUrl, apiKey) {
        this.url = emailServiceUrl;
        this.apiKey = apiKey;
    }

    async sendBillEmail(customerEmail, billData) {
        try {
            const emailContent = `
<h2>Thank You for Your Purchase!</h2>
<p><strong>Bill Number:</strong> ${billData.billId}</p>
<p><strong>Total Amount:</strong> ₹${billData.amount}</p>
<p><strong>Payment Method:</strong> ${billData.paymentMethod}</p>
<p><strong>Date & Time:</strong> ${new Date(billData.date).toLocaleString()}</p>
<h3>Items Purchased:</h3>
<ul>
${billData.items.map(item => `
    <li>${item.productName} - ${item.quantity}${item.unit} @ ₹${item.unitPrice} = ₹${item.totalPrice}</li>
`).join('')}
</ul>
<p>Shopping ke liye Dhanyavaad!</p>
            `;

            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    to: customerEmail,
                    subject: `Bill Receipt - ${billData.billId}`,
                    html: emailContent
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }
}

// ====================================
// GOOGLE FIREBASE INTEGRATION
// ====================================

class FirebaseIntegration {
    constructor(firebaseConfig) {
        this.config = firebaseConfig;
        // Initialize Firebase in your HTML:
        // <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
        // <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
    }

    async saveBillToFirebase(billData) {
        try {
            // Using Firestore
            const docRef = await addDoc(collection(db, "bills"), {
                billId: billData.billId,
                amount: billData.amount,
                items: billData.items,
                paymentMethod: billData.paymentMethod,
                customerName: billData.customerName,
                customerPhone: billData.customerPhone,
                createdAt: new Date(),
                timestamp: serverTimestamp()
            });

            return { success: true, docId: docRef.id };
        } catch (error) {
            console.error('Firebase error:', error);
            throw error;
        }
    }

    async getBillsFromFirebase(limit = 100) {
        try {
            const q = query(collection(db, "bills"), orderBy("createdAt", "desc"), limit(limit));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Firebase query error:', error);
            throw error;
        }
    }
}

// ====================================
// ANALYTICS TRACKING
// ====================================

class AnalyticsTracker {
    constructor(googleAnalyticsId) {
        this.gaId = googleAnalyticsId;
        this.loadGoogleAnalytics();
    }

    loadGoogleAnalytics() {
        // Add Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', this.gaId);
    }

    trackBillCompletion(billData) {
        gtag('event', 'purchase', {
            'transaction_id': billData.billId,
            'value': billData.amount,
            'currency': 'INR',
            'items': billData.items.map(item => ({
                'item_id': item.productId,
                'item_name': item.productName,
                'quantity': item.quantity,
                'price': item.unitPrice
            }))
        });
    }

    trackProductView(product) {
        gtag('event', 'view_item', {
            'items': [{
                'item_id': product.id,
                'item_name': product.name,
                'price': product.price
            }]
        });
    }

    trackPageView(pageName) {
        gtag('event', 'page_view', {
            'page_title': pageName,
            'page_path': window.location.pathname
        });
    }
}

// ====================================
// INVENTORY MANAGEMENT
// ====================================

class InventoryManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async updateProductStock(productId, quantitySold) {
        try {
            const product = await this.supabase.query(`products?id=eq.${productId}`);
            
            if (product.length === 0) {
                throw new Error('Product not found');
            }

            const currentStock = product[0].stock || 0;
            const newStock = currentStock - quantitySold;

            if (newStock < 0) {
                throw new Error('Insufficient stock');
            }

            return await this.supabase.query(
                `products?id=eq.${productId}`,
                'PATCH',
                { stock: newStock }
            );
        } catch (error) {
            console.error('Inventory update error:', error);
            throw error;
        }
    }

    async getInventoryReport() {
        try {
            const products = await this.supabase.query('products');
            
            const report = products.map(product => ({
                name: product.name,
                stock: product.stock || 0,
                reorderLevel: product.reorder_level || 10,
                needsReorder: (product.stock || 0) < (product.reorder_level || 10)
            }));

            return report.filter(item => item.needsReorder);
        } catch (error) {
            console.error('Inventory report error:', error);
            throw error;
        }
    }
}

// ====================================
// PRINT BILL
// ====================================

class BillPrinter {
    static printBill(billData) {
        const printWindow = window.open('', '', 'height=500,width=500');
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Bill - ${billData.billId}</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 10px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
        .items { margin: 20px 0; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .footer { border-top: 2px dashed #000; text-align: center; margin-top: 10px; padding-top: 10px; }
        .total { font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>EZO BILLING</h2>
        <p>Bill #${billData.billId}</p>
        <p>${new Date(billData.date).toLocaleString('en-IN')}</p>
    </div>
    
    <div class="items">
        ${billData.items.map(item => `
            <div class="item">
                <span>${item.productName}</span>
                <span>₹${item.totalPrice.toFixed(2)}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="footer">
        <div class="item">
            <span>TOTAL:</span>
            <span class="total">₹${billData.amount.toFixed(2)}</span>
        </div>
        <div class="item">
            <span>Payment:</span>
            <span>${billData.paymentMethod}</span>
        </div>
        <p style="margin-top: 20px; font-style: italic;">Shopping ke liye Dhanyavaad!</p>
    </div>
</body>
</html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    }
}

// Usage:
// BillPrinter.printBill(billData);

// ====================================
// EXPORT DATA TO CSV
// ====================================

class DataExporter {
    static exportBillsToCSV(bills, filename = 'bills.csv') {
        let csv = 'Bill #,Date,Amount,Payment Method,Customer,Items Count\n';
        
        bills.forEach(bill => {
            csv += `${bill.billId},${bill.date},${bill.amount},${bill.paymentMethod},"${bill.customerName}",${bill.items.length}\n`;
        });

        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = filename;
        link.click();
    }

    static exportToJSON(data, filename = 'data.json') {
        const link = document.createElement('a');
        link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        link.download = filename;
        link.click();
    }
}

// ====================================
// USAGE EXAMPLES
// ====================================

/*
// Initialize integrations
const razorpay = new RazorpayIntegration('YOUR_RAZORPAY_KEY');
const sms = new TwilioSMSNotification('YOUR_TWILIO_URL', 'YOUR_AUTH_TOKEN');
const email = new EmailNotification('YOUR_EMAIL_SERVICE_URL', 'YOUR_API_KEY');
const analytics = new AnalyticsTracker('YOUR_GA_ID');
const inventory = new InventoryManager(supabase);

// After payment completion
async function completePaymentWithIntegrations(billData) {
    // Track analytics
    analytics.trackBillCompletion(billData);
    
    // Send SMS
    if (billData.customerPhone) {
        await sms.sendBillSMS(billData.customerPhone, billData);
    }
    
    // Send email
    if (billData.customerEmail) {
        await email.sendBillEmail(billData.customerEmail, billData);
    }
    
    // Update inventory
    for (let item of billData.items) {
        await inventory.updateProductStock(item.productId, item.quantity);
    }
    
    // Print bill
    BillPrinter.printBill(billData);
    
    // Export data
    DataExporter.exportToJSON(billData);
}
*/
