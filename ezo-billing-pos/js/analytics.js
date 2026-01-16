// Analytics Dashboard Logic
class AnalyticsDashboard {
    constructor() {
        this.reportType = 'daily';
        this.daysFilter = 7;
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Analytics Dashboard...');
        
        // Load data
        await salesAnalytics.loadBills();
        
        // Update date/time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Load initial charts
        this.loadDashboard();
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

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AnalyticsDashboard();
});
