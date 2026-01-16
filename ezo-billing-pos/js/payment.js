// Payment Processing Module
class PaymentProcessor {
    constructor() {
        this.paymentMethods = ['Cash', 'Card', 'Online'];
    }

    validatePayment(amount, method) {
        if (!this.paymentMethods.includes(method)) {
            throw new Error('Invalid payment method');
        }
        if (amount <= 0) {
            throw new Error('Invalid amount');
        }
        return true;
    }

    processPayment(amount, method) {
        this.validatePayment(amount, method);

        const paymentRecord = {
            amount: amount,
            method: method,
            timestamp: new Date().toISOString(),
            status: 'completed',
            transactionId: this.generateTransactionId()
        };

        return paymentRecord;
    }

    generateTransactionId() {
        return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    getPaymentMethods() {
        return this.paymentMethods;
    }

    // Simulate online payment (in real app, integrate with Razorpay/PayPal)
    async processOnlinePayment(amount, customerEmail) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    paymentRecord: this.processPayment(amount, 'Online')
                });
            }, 2000);
        });
    }
}

const paymentProcessor = new PaymentProcessor();
