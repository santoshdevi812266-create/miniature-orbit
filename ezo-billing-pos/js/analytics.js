// Analytics Dashboard Logic
class AnalyticsDashboard {
    constructor() {
        this.reportType = 'daily';
        this.daysFilter = 7;
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Analytics Dashboard...');
        
        try {
            // Wait for salesAnalytics to be ready
            if (!window.salesAnalytics) {
                console.log('Waiting for salesAnalytics to be available...');
                let waitCount = 0;
                while (!window.salesAnalytics && waitCount < 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waitCount++;
                }
            }

            if (!window.salesAnalytics) {
                console.error('salesAnalytics not available');
                throw new Error('Analytics module not loaded');
            }

            // Load data
            await salesAnalytics.loadBills();
            
            // Update date/time
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 1000);
            
            // Load initial charts
            this.loadDashboard();
        } catch (error) {
            console.error('Error initializing analytics:', error);
            document.getElementById('analyticsContainer').innerHTML = `<p style="color: red;">Error loading analytics: ${error.message}</p>`;
        }
    }

    updateDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('dateTime').textContent = now.toLocaleDateString('en-IN', options);
    }

    async loadDashboard() {
        // Update statistics
        this.updateStats();
        
        // Render charts
        this.renderCharts();
        
        // Display payment methods
        this.displayPaymentMethods();
    }

    updateStats() {
        // Today
        const today = salesAnalytics.getDailySales();
        const todayTotal = today.reduce((sum, bill) => sum + bill.total_amount, 0);
        
        document.getElementById('todayTotal').textContent = todayTotal.toFixed(0);
        document.getElementById('todayTransactions').textContent = today.length;

        // Week
        const week = salesAnalytics.getWeeklySales();
        const weekTotal = week.reduce((sum, bill) => sum + bill.total_amount, 0);
        
        document.getElementById('weekTotal').textContent = weekTotal.toFixed(0);
        document.getElementById('weekTransactions').textContent = week.length;

        // Month
        const month = salesAnalytics.getMonthlySales();
        const monthTotal = month.reduce((sum, bill) => sum + bill.total_amount, 0);
        
        document.getElementById('monthTotal').textContent = monthTotal.toFixed(0);
        document.getElementById('monthTransactions').textContent = month.length;

        // Average
        const totalBills = salesAnalytics.bills.length;
        const totalAmount = salesAnalytics.bills.reduce((sum, bill) => sum + bill.total_amount, 0);
        const avgTransaction = totalBills > 0 ? totalAmount / totalBills : 0;
        
        document.getElementById('avgTransaction').textContent = avgTransaction.toFixed(0);
    }

    renderCharts() {
        // Daily chart
        const dailyData = salesAnalytics.getDailyChartData(parseInt(document.getElementById('daysFilter').value) || 7);
        ChartRenderer.createBarChart('dailyChart', dailyData, 'Daily Sales Trend', 'Amount (₹)');

        // Weekly chart
        const weeklyData = salesAnalytics.getWeeklyChartData(12);
        ChartRenderer.createLineChart('weeklyChart', weeklyData, 'Weekly Sales Trend', 'Amount (₹)');

        // Payment methods
        const paymentData = Object.entries(salesAnalytics.getPaymentMethodSummary()).map(([method, data]) => ({
            label: method,
            method: method,
            total: data.total,
            count: data.count
        }));
        
        if (paymentData.length > 0) {
            ChartRenderer.createPieChart('paymentChart', paymentData, 'Payment Methods');
        }
    }

    displayPaymentMethods() {
        const summary = salesAnalytics.getPaymentMethodSummary();
        const container = document.getElementById('paymentMethods');
        
        const icons = {
            'Cash': '💵',
            'Card': '💳',
            'Online': '📱'
        };

        container.innerHTML = Object.entries(summary).map(([method, data]) => `
            <div class="method-card">
                <div class="icon">${icons[method] || '💰'}</div>
                <h4>${method}</h4>
                <div class="amount">₹${data.total.toFixed(0)}</div>
                <div class="count">${data.count} transactions</div>
            </div>
        `).join('');
    }
}

// Global functions
function changeReportType(type) {
    dashboard.reportType = type;
    dashboard.loadDashboard();
}

function updateCharts() {
    dashboard.daysFilter = parseInt(document.getElementById('daysFilter').value);
    dashboard.renderCharts();
}

function exportReport() {
    const data = {
        generatedDate: new Date().toLocaleString('en-IN'),
        dailySales: salesAnalytics.calculateDailySalesTotal(),
        weeklySales: salesAnalytics.calculateWeeklySalesTotal(),
        monthlySales: salesAnalytics.calculateMonthlySalesTotal(),
        totalTransactions: salesAnalytics.bills.length,
        paymentSummary: salesAnalytics.getPaymentMethodSummary(),
        dailyChart: salesAnalytics.getDailyChartData(7),
        weeklyChart: salesAnalytics.getWeeklyChartData(12)
    };

    // Convert to CSV
    let csv = 'EZO Billing - Sales Report\n';
    csv += `Generated: ${data.generatedDate}\n\n`;
    
    csv += 'Summary\n';
    csv += `Daily Sales,₹${data.dailySales.toFixed(2)}\n`;
    csv += `Weekly Sales,₹${data.weeklySales.toFixed(2)}\n`;
    csv += `Monthly Sales,₹${data.monthlySales.toFixed(2)}\n`;
    csv += `Total Transactions,${data.totalTransactions}\n\n`;

    csv += 'Payment Methods\n';
    Object.entries(data.paymentSummary).forEach(([method, info]) => {
        csv += `${method},${info.count},₹${info.total.toFixed(2)}\n`;
    });

    csv += '\nDaily Sales Trend\n';
    csv += 'Date,Amount,Transactions\n';
    data.dailyChart.forEach(item => {
        csv += `${item.date},${item.total.toFixed(2)},${item.transactions}\n`;
    });

    // Download CSV
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showAlert('Report exported successfully!', 'success');
}

function printReport() {
    const printWindow = window.open('', '', 'height=600,width=800');
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sales Report</title>
        <style>
            body { font-family: Arial; margin: 20px; }
            h1 { text-align: center; color: #1a1a2e; }
            .stat { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #0f3460; }
            .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
            .stat-value { font-size: 20px; font-weight: bold; color: #0f3460; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background: #1a1a2e; color: white; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <h1>EZO Billing - Sales Report</h1>
        <p style="text-align: center; color: #666;">${new Date().toLocaleString('en-IN')}</p>

        <div class="stat">
            <div class="stat-label">Today's Sales</div>
            <div class="stat-value">₹${salesAnalytics.calculateDailySalesTotal().toFixed(0)}</div>
        </div>

        <div class="stat">
            <div class="stat-label">This Week's Sales</div>
            <div class="stat-value">₹${salesAnalytics.calculateWeeklySalesTotal().toFixed(0)}</div>
        </div>

        <div class="stat">
            <div class="stat-label">This Month's Sales</div>
            <div class="stat-value">₹${salesAnalytics.calculateMonthlySalesTotal().toFixed(0)}</div>
        </div>

        <h2>Payment Methods</h2>
        <table>
            <tr>
                <th>Method</th>
                <th>Transactions</th>
                <th>Amount</th>
            </tr>
            ${Object.entries(salesAnalytics.getPaymentMethodSummary()).map(([method, data]) => `
                <tr>
                    <td>${method}</td>
                    <td>${data.count}</td>
                    <td>₹${data.total.toFixed(2)}</td>
                </tr>
            `).join('')}
        </table>

        <div class="footer">
            <p>Shopping ke liye Dhanyavaad! 🙏</p>
            <p>Printed from EZO Billing System</p>
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 999; max-width: 300px;';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function exportReport() {
    try {
        const billHistory = JSON.parse(localStorage.getItem('billHistory') || '[]');
        
        if (billHistory.length === 0) {
            alert('No sales data to export');
            return;
        }
        
        // Create CSV content
        let csv = 'Bill Number,Date,Customer Name,Phone,Items Count,Subtotal,Discount %,Discount Amount,Total,Payment Method\n';
        
        billHistory.forEach(bill => {
            const date = new Date(bill.date).toLocaleString('en-IN');
            const customerName = bill.customerName || 'Walk-in';
            const phone = bill.customerPhone || '-';
            const itemsCount = bill.items ? bill.items.length : 1;
            
            csv += `"${bill.billNumber}","${date}","${customerName}","${phone}",${itemsCount},${bill.subtotal || 0},${bill.discountPercent || 0},${bill.discount || 0},${bill.total || 0},"${bill.paymentMethod || 'Unknown'}"\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✓ Report exported: ${fileName}`);
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report: ' + error.message);
    }
}

async function downloadSalesReportPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const billHistory = JSON.parse(localStorage.getItem('billHistory') || '[]');
        
        if (billHistory.length === 0) {
            alert('No sales data available');
            return;
        }
        
        const doc = new jsPDF();
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        // Header
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('SALES REPORT', margin, yPos);
        
        yPos += 8;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const reportDate = new Date().toLocaleString('en-IN');
        doc.text(`Generated: ${reportDate}`, margin, yPos);
        
        yPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        
        // Summary stats
        doc.setFontSize(10);
        doc.setTextColor(33, 33, 33);
        const totalBills = billHistory.length;
        const totalAmount = billHistory.reduce((sum, bill) => sum + (bill.total || 0), 0);
        const totalDiscount = billHistory.reduce((sum, bill) => sum + (bill.discount || 0), 0);
        
        doc.text(`Total Bills: ${totalBills}`, margin, yPos);
        yPos += 6;
        doc.text(`Total Sales: ₹${totalAmount.toFixed(2)}`, margin, yPos);
        yPos += 6;
        doc.text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, margin, yPos);
        
        yPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        
        // Table headers
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text('Bill #', margin, yPos);
        doc.text('Date', margin + 40, yPos);
        doc.text('Customer', margin + 85, yPos);
        doc.text('Total', pageWidth - margin - 25, yPos, { align: 'right' });
        
        yPos += 6;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
        
        // Table data
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        
        billHistory.forEach((bill, index) => {
            const billDate = new Date(bill.date).toLocaleDateString('en-IN');
            const customer = (bill.customerName || 'Walk-in').substring(0, 20);
            const amount = `₹${(bill.total || 0).toFixed(2)}`;
            
            doc.text(bill.billNumber, margin, yPos);
            doc.text(billDate, margin + 40, yPos);
            doc.text(customer, margin + 85, yPos);
            doc.text(amount, pageWidth - margin - 25, yPos, { align: 'right' });
            
            yPos += 5;
            
            // New page if needed
            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = 20;
                
                // Repeat headers
                doc.setFont(undefined, 'bold');
                doc.setFontSize(9);
                doc.setTextColor(33, 33, 33);
                doc.text('Bill #', margin, yPos);
                doc.text('Date', margin + 40, yPos);
                doc.text('Customer', margin + 85, yPos);
                doc.text('Total', pageWidth - margin - 25, yPos, { align: 'right' });
                yPos += 6;
                
                doc.setFont(undefined, 'normal');
                doc.setFontSize(8);
                doc.setTextColor(50, 50, 50);
            }
        });
        
        // Footer
        yPos = pageHeight - 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('EZO Billing System', margin, yPos);
        doc.text(`Page ${doc.internal.pages.length}`, pageWidth - margin - 20, yPos, { align: 'right' });
        
        const fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        alert(`✓ Report downloaded: ${fileName}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

function printReport() {
    // Open print dialog for current page
    window.print();
}

    dashboard = new AnalyticsDashboard();
});
