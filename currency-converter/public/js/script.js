const dropList = document.querySelectorAll("form select"),
    fromCurrency = document.querySelector(".from select"),
    toCurrency = document.querySelector(".to select"),
    getButton = document.querySelector("form button"),
    exchangeRateTxt = document.querySelector("form .exchange-rate");

let exchangeRates = {};

for (let i = 0; i < dropList.length; i++) {
    for(let currency_code in country_list){
        let selected = i == 0 ? currency_code == "USD" ? "selected" : "" : currency_code == "NPR" ? "selected" : "";
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e =>{
        loadFlag(e.target);
    });
}

function loadFlag(element){
    for(let code in country_list){
        if(code == element.value){ 
            let imgTag = element.parentElement.querySelector("img");
            imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
        }
    }
}

window.addEventListener("load", ()=>{
    getExchangeRate();
});

getButton.addEventListener("click", e =>{
    e.preventDefault();
    getExchangeRate();
});

const exchangeIcon = document.querySelector("form .icon");
exchangeIcon.addEventListener("click", ()=>{
    let tempCode = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCode;
    loadFlag(fromCurrency);
    loadFlag(toCurrency); 
    getExchangeRate(); 
});

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
});

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'exchangeRate') {
        const amount = document.querySelector("form input").value;
        exchangeRateTxt.innerText = `${amount} ${fromCurrency.value} = ${data.rate} ${toCurrency.value}`;
        displayConvertedAmounts(data.rate);
    } else if (data.type === 'error') {
        exchangeRateTxt.innerText = data.message;
    } else if (data.type === 'ratesUpdate') {
        exchangeRates = data.rates;
        console.log('Exchange rates updated:', exchangeRates);
    }
});

function getExchangeRate(){
    const amount = document.querySelector("form input").value;
    let amountVal = amount;
    if(amountVal == "" || amountVal == "0"){
        amountVal = 1;
    }

    const request = {
        type: 'getExchangeRate',
        fromCurrency: fromCurrency.value,
        toCurrency: toCurrency.value,
        amount: amountVal
    };

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(request));
    } else {
        console.error('WebSocket connection is not open');
    }
}


let btc = document.getElementById("bitcoin");
let ltc = document.getElementById("litecoin");
let eth = document.getElementById("ethereum");
let doge = document.getElementById("dogecoin");

let liveprice = {
    "async": true,
    "scroosDomain": true,
    "url": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Clitecoin%2Cethereum%2Cdogecoin&vs_currencies=usd",

    "method": "GET",
    "headers": {}
}

$.ajax(liveprice).done(function (response){
    btc.innerHTML = response.bitcoin.usd;
    ltc.innerHTML = response.litecoin.usd;
    eth.innerHTML = response.ethereum.usd;
    doge.innerHTML = response.dogecoin.usd;

});

const convertedBitcoin = document.getElementById("convertedBitcoin");
const convertedLitecoin = document.getElementById("convertedLitecoin");
const convertedEthereum = document.getElementById("convertedEthereum");
const convertedDogecoin = document.getElementById("convertedDogecoin");

function displayConvertedAmounts(amount) {
    if (!amount || isNaN(amount)) return;

    convertedBitcoin.textContent = (amount / btcPrice).toFixed(8); // Display in Bitcoin
    convertedLitecoin.textContent = (amount / ltcPrice).toFixed(8); // Display in Litecoin
    convertedEthereum.textContent = (amount / ethPrice).toFixed(8); // Display in Ethereum
    convertedDogecoin.textContent = (amount / dogePrice).toFixed(8); // Display in Dogecoin
}

let btcPrice, ltcPrice, ethPrice, dogePrice;

$.ajax(liveprice).done(function (response) {
    btcPrice = response.bitcoin.usd;
    ltcPrice = response.litecoin.usd;
    ethPrice = response.ethereum.usd;
    dogePrice = response.dogecoin.usd;
});

