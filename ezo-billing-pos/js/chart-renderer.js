// Chart Rendering using Canvas (no external library needed)
class ChartRenderer {
    static createBarChart(canvasId, data, title, yLabel) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;

        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.total || d.value || 0));
        const scale = maxValue > 0 ? chartHeight / maxValue : 1;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw bars
        const barWidth = chartWidth / data.length;
        const barSpacing = barWidth * 0.8;
        const actualBarWidth = barSpacing * 0.7;

        data.forEach((item, index) => {
            const value = item.total || item.value || 0;
            const barHeight = value * scale;
            
            const x = padding + (index * barSpacing) + (barSpacing - actualBarWidth) / 2;
            const y = canvas.height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = '#0f3460';
            ctx.fillRect(x, y, actualBarWidth, barHeight);

            // Draw value on top of bar
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`₹${value.toFixed(0)}`, x + actualBarWidth / 2, y - 5);

            // Draw label
            ctx.save();
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const label = item.date || item.week || item.label || index;
            ctx.fillText(label, x + actualBarWidth / 2, canvas.height - padding + 20);
            ctx.restore();
        });

        // Draw title
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 20);
    }

    static createLineChart(canvasId, data, title, yLabel) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;

        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.total || d.value || 0));
        const scale = maxValue > 0 ? chartHeight / maxValue : 1;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw line
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((item, index) => {
            const value = item.total || item.value || 0;
            const x = padding + (index * chartWidth / (data.length - 1 || 1));
            const y = canvas.height - padding - (value * scale);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        data.forEach((item, index) => {
            const value = item.total || item.value || 0;
            const x = padding + (index * chartWidth / (data.length - 1 || 1));
            const y = canvas.height - padding - (value * scale);

            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Draw value
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`₹${value.toFixed(0)}`, x, y - 15);

            // Draw label
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            const label = item.date || item.week || item.label || index;
            ctx.fillText(label, x, canvas.height - padding + 20);
        });

        // Draw title
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 20);
    }

    static createPieChart(canvasId, data, title) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate total
        const total = data.reduce((sum, item) => sum + (item.value || item.total || 0), 0);

        // Colors
        const colors = ['#0f3460', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

        let currentAngle = 0;

        data.forEach((item, index) => {
            const value = item.value || item.total || 0;
            const sliceAngle = (value / total) * 2 * Math.PI;

            // Draw slice
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percentage = ((value / total) * 100).toFixed(0);
            ctx.fillText(percentage + '%', labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw title
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 20);

        // Draw legend
        let legendY = canvas.height - 80;
        data.forEach((item, index) => {
            const label = item.label || item.method || item.name || `Item ${index + 1}`;
            const value = item.value || item.total || 0;

            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(20, legendY, 12, 12);

            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${label}: ₹${value.toFixed(0)}`, 40, legendY + 10);

            legendY += 20;
        });
    }
}
