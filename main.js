const fs = require('fs');
const puppeteer = require('puppeteer');
const path = 'output.log'; // Путь к файлу для вывода логов
(async () => {
    // Запуск браузера
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200 });

    const cookiesString = fs.readFileSync('cookies.json');
    const cookies = JSON.parse(cookiesString);
    // Устанавливаем cookie на странице
    await page.setCookie(...cookies);

    await page.goto('https://plgrubet.com/');
    // Создание скриншота страницы
    await page.waitForTimeout(5000);

    page.on('console', (msg) => {
        console.log(`Эмулированный браузер: ${msg.text()}`);
    });
        // Перенаправление вывода console.log в файл
    const logStream = fs.createWriteStream(path, { flags: 'a' });
    console.log = (msg) => logStream.write(`${msg}\n`);

    const injectedScript = `
    var bet = 2;
var firstBet = bet;
var loss_count = 0;
var count = 6;
var balanceNow;
function GetColor() {
    // Получаем все элементы <li> внутри списка <ul> с классом "balls"
    const liElements = document.querySelectorAll('ul.balls li');
    // Получаем последний элемент из полученного списка
    const lastLiElement = liElements[liElements.length - 1];
    // Находим внутри последнего элемента <li> элемент <span>
    const spanElement = lastLiElement.querySelector('span');
    // Получаем имя класса у элемента <span>
    const className = spanElement.getAttribute('class');
    return className;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function GetRollId() {
    const liElements = document.querySelectorAll('ul.balls li');
    const lastLiElement = liElements[liElements.length - 1];
    return lastLiElement.getAttribute('data-rollid');
}
var id = GetRollId();
async function start() {
    console.log("старт");
    if (id != GetRollId()) {
        id = GetRollId(); console.log("получил id");
        if (GetColor() == "dark") {
            console.log("цвет черн");
            loss_count = 0;
            firstBet = bet;
        }
        else {
            loss_count++;
            console.log("цвет дургой " + loss_count);
            if (loss_count == count) {
                console.log("ставим первый раз");
                await sleep(500);//500
                balanceNow = await balance();//500
                console.log("баланс: " + balanceNow);
                send(firstBet);
                console.log("ставка " + firstBet);
                await sleep(2000);//2000
                while (balanceNow == await balance()) {//500
                    console.log("баланс не изменился, ставим ещё раз" + balanceNow);
                    await sleep(2000);//1000
                    send(firstBet);
                    console.log("ставка " + firstBet);
                }
                console.log("баланс изменился: " + await balance());
            } else if (loss_count > count) {
                console.log("ставим с умножением");
                firstBet = firstBet * 2;
                await sleep(500);
                balanceNow = await balance();
                console.log("баланс: " + balanceNow);
                send(firstBet);
                console.log("ставка " + firstBet);
                await sleep(2000);
                while (balanceNow == await balance()) {
                    console.log("баланс не изменился, ставим ещё раз" + balanceNow);
                    await sleep(2000);
                    send(firstBet);
                    console.log("ставка " + firstBet);
                }
                console.log("баланс изменился: " + await balance());
            }
        }
    }
}


function send(amount) {
    const url = 'https://plgrubet.com/scripts/roulette/b_numbers';
    const cookies = document.cookie;
    const data = new URLSearchParams();
    data.append('amount', amount);
    data.append('lower', '8');
    data.append('upper', '14');
    data.append('round', GetRollId());
    data.append('balance_type', '1');

    fetch(url, {
        method: 'POST',
        headers: {
            'Host': 'plgrubet.com',
            'Connection': 'keep-alive',
            'Content-Length': '54',
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            cookies
        },
        body: data.toString()
    })
        .then(data => {
            console.log('Ответ от сервера:', data);
        })
}

async function balance() {
    const updateBal = document.getElementById('balance_update');
    updateBal.click()
    await sleep(500);
    const balanceElement = document.getElementById('balance_r');
    const balanceValue = balanceElement.textContent;
    return balanceValue;
}

setInterval(start, 11000);`;

    await page.evaluate(injectedScript);
    setInterval(async function () { await page.screenshot({ path: 'example.png' }) }, 5000);
    // Выполнение JavaScript-кода на странице
    //   await page.type('input.newlogindialog_TextInput_2eKVn[type="text"]', 'volksven606', { delay: 100 });
    //   await page.type('input.newlogindialog_TextInput_2eKVn[type="password"]', 'Vladsven606', { delay: 100 });
    //   await page.waitForTimeout(2000);
    //   await page.screenshot({ path: 'example1.png' });
    //   await page.click('button.newlogindialog_SubmitButton_2QgFE[type="submit"]');
    //   await page.waitForTimeout(60000);
    //   await page.click('#imageLogin');
    //   await page.screenshot({ path: 'example2.png' });
    //   await page.waitForTimeout(20000);
    //   await page.screenshot({ path: 'example3.png' });
    //   const cookies = await page.cookies();
    //   fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));

    // Закрытие браузера
    //await browser.close();
})();
