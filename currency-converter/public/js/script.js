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