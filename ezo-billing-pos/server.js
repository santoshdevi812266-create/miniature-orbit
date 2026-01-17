const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pos', (req, res) => {
    res.sendFile(path.join(__dirname, 'pos-enhanced.html'));
});

app.get('/scanner', (req, res) => {
    res.sendFile(path.join(__dirname, 'scanner-app.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'analytics.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`EZO Billing POS running on http://localhost:${PORT}`);
});
