// Barcode Scanner Module
class BarcodeScanner {
    constructor(onScanCallback) {
        this.onScan = onScanCallback;
        this.buffer = '';
        this.lastScanTime = 0;
        this.scanDelay = 100; // milliseconds
    }

    initialize() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        console.log('Barcode scanner initialized');
    }

    handleKeyDown(event) {
        const now = Date.now();
        
        // Reset buffer if too much time has passed
        if (now - this.lastScanTime > 100) {
            this.buffer = '';
        }

        this.lastScanTime = now;

        // Collect characters (avoid processing modifiers and special keys)
        if (event.key.length === 1) {
            this.buffer += event.key;
        }

        // Detect barcode scan (typically ends with Enter)
        if (event.key === 'Enter' && this.buffer.length > 0) {
            const barcode = this.buffer.trim();
            this.buffer = '';
            
            if (this.validateBarcode(barcode)) {
                this.onScan(barcode);
            }
            event.preventDefault();
        }
    }

    validateBarcode(barcode) {
        // Accept barcodes with at least 5 characters
        return barcode.length >= 5;
    }

    // Simulate barcode scanning for testing
    simulateScan(barcode) {
        this.onScan(barcode);
    }
}
