const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let exchangeRates = {};
const API_KEY = '811f483d4bff3f9925cdaa95';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

async function fetchExchangeRates() {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(BASE_URL);
        const data = await response.json();
        if (data.conversion_rates) {
            exchangeRates = data.conversion_rates;
            console.log('Exchange rates updated');
            broadcastRates();
        } else {
            console.error('Failed to update exchange rates');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

function broadcastRates() {
    const data = JSON.stringify({ type: 'ratesUpdate', rates: exchangeRates });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

fetchExchangeRates();
setInterval(fetchExchangeRates, 3600000);

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        let parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'getExchangeRate') {
            const { fromCurrency, toCurrency, amount } = parsedMessage;
            if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
                const rate = (amount * (exchangeRates[toCurrency] / exchangeRates[fromCurrency])).toFixed(2);
                ws.send(JSON.stringify({ type: 'exchangeRate', rate }));
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid currency code' }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

