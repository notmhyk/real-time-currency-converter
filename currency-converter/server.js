const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        let parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'getExchangeRate') {
            fetchExchangeRate(parsedMessage.fromCurrency, parsedMessage.toCurrency, parsedMessage.amount)
                .then(rate => {
                    ws.send(JSON.stringify({ type: 'exchangeRate', rate }));
                })
                .catch(error => {
                    ws.send(JSON.stringify({ type: 'error', message: error.message }));
                });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function fetchExchangeRate(fromCurrency, toCurrency, amount) {
    return new Promise((resolve, reject) => {
        let url = `https://v6.exchangerate-api.com/v6/811f483d4bff3f9925cdaa95/latest/${fromCurrency}`;
        fetch(url)
            .then(response => response.json())
            .then(result => {
                if (result.conversion_rates && result.conversion_rates[toCurrency]) {
                    let exchangeRate = result.conversion_rates[toCurrency];
                    let totalExRate = (amount * exchangeRate).toFixed(2);
                    resolve(totalExRate);
                } else {
                    reject(new Error('Invalid currency code'));
                }
            })
            .catch(reject);
    });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});