// QR Code Generation using QR Server API (no library needed)
class QRCodeGenerator {
    static generateQRCode(data, size = 200) {
        const encodedData = encodeURIComponent(data);
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
    }

    static generateBillQR(billData) {
        const billString = `BILL:${billData.billId}|AMOUNT:${billData.amount}|DATE:${billData.date}|CUST:${billData.customer || 'Guest'}`;
        return this.generateQRCode(billString, 250);
    }

    static createQRElement(data, size = 200) {
        const img = document.createElement('img');
        img.src = this.generateQRCode(data, size);
        img.alt = 'QR Code';
        img.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border: 2px solid #333;
            padding: 5px;
        `;
        return img;
    }
}
