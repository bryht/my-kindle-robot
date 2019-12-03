import puppeteer, { Browser, Page } from "puppeteer";
import path from 'path';
import fs from 'fs-extra';


export class BrowserHelper {

    browser: Browser;
    page: Page;
    constructor() {

    }

    async init() {
        await this.newPage();
    }

    async newBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
            devtools: false,
            slowMo: 15,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
            ...global['browser']
        });
    }


    async newPage() {
        if (this.browser == undefined) {
            await this.newBrowser();
        }
        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(global['browser']['timeout']);
        await this.page.setViewport({
            width: 1024,
            height: 768,
            deviceScaleFactor: 1,
        })
        return this.page;
    }

    async goto(url: string) {
        await this.page.goto(url);
    }

    /**
     * click <a/> or <button/> by innerText
     * @param searchText search innerText text
     */
    async clickByText(searchText: string, type: string = '') {
        await this.log(searchText, true);
        await this.waitForText(searchText);
        var expression = '//button|//a|//div[@role = "button"]';
        if (type != '') {
            expression = `//${type}`;
        }
        const elementList = await this.page.$x(expression);
        for (let index = 0; index < elementList.length; index++) {
            const prop = await elementList[index].getProperty('innerText');
            const value = await prop.jsonValue();
            if (value.indexOf(searchText) > -1) {
                return await elementList[index].click();
            }
        }
        throw new Error('button or a link not found');
    }

    /**
     * click by content, only search inside text
     * @param searchValue search value
     * @param type div or p or ...
     */
    async clickByContent(searchValue: string, type: string) {
        await this.log(searchValue);
        await this.waitForText(searchValue);
        const elementList = await this.page.$x(`//${type}[contains(text(), "${searchValue}")]`);
        if (elementList.length > 0) {
            return await elementList[0].click();
        }
        throw new Error('click item not found');
    }

    async click(selector: string) {
        await this.log(selector, true);
        await this.page.waitForSelector(selector);
        await this.page.click(selector);
    }

    async type(selector: string, value: string) {
        await this.log(`${selector}--${value}`);
        await this.page.waitForSelector(selector);
        await this.page.type(selector, value);
    }

    async clear(selector: string) {
        const input = await this.page.$(selector);
        await input.click({ clickCount: 3 });
        await input.press('Backspace');
    }

    async select(selector: string, value: string) {
        await this.log(`${selector}--${value}`);
        await this.page.waitForSelector(selector);
        await this.page.select(selector, value);
    }

    async typeByPlaceHolder(searchText: string, value: string) {
        await this.log(`${searchText}--${value}`);
        const elementList = await this.page.$x('//input');
        for (let index = 0; index < elementList.length; index++) {
            const prop = await elementList[index].getProperty('placeholder');
            const placeholder = await prop.jsonValue();
            if (placeholder.indexOf(searchText) > -1) {
                return await elementList[index].type(value)
            }
        }
        throw new Error('input not found');
    }

    async waitForText(text: string) {
        await this.log(`${text}`);
        return await this.page.waitForFunction(`document.querySelector("body").innerText.includes("${text}")`);
    }

    async waitForRequest(urlText: string) {
        await this.log(`${urlText}`);
        return await this.page.waitForResponse(r => r.url().toLowerCase().indexOf(urlText.toLowerCase()) > -1 && (r.status() == 200 || r.status() == 201||r.status()==302));
    }

    async waitFor(seconds:number){
        await this.page.waitFor(seconds*1000);
    }

    async uploadFile(inputSelector: string, filePath: string) {
        await this.log(`${inputSelector}`);
        var input = await this.page.waitForSelector(inputSelector);
        return await input.uploadFile(path.resolve(__dirname, filePath));
    }

    async pressDown() {
        return await this.page.keyboard.press('ArrowDown');
    }

    async pressEnter() {
        return await this.page.keyboard.press('Enter');
    }

    async pressRight(times: number = 1) {
        for (let index = 0; index < times; index++) {
            await this.page.keyboard.press('ArrowRight');
        }
    }

    async close() {
        if (this.page.isClosed() == false) {
            await this.page.close();
        }
        if (this.browser.isConnected() == false) {
            this.browser.removeAllListeners();
            this.browser.disconnect();
        }
        await this.browser.close();
    }

    async log(keywords: string, hasPicture: boolean = false) {
        let date = new Date()
        let formatDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getMilliseconds()}`;
        let getStackTrace = function () {
            var obj = { stack: null };
            Error.captureStackTrace(obj, getStackTrace);
            return obj.stack;
        };
        var stackTraceList: string[] = getStackTrace().split('\n');
        var stackTrace = stackTraceList.find(p => p.indexOf('.test.ts') > -1);
        if (global['logSteps']) {
            console.log(`time:${formatDate}\nkeywords:${keywords}\nstack:${stackTrace}`);
        }

        if (hasPicture && global['screenshot']) {
            await this.screenshot(keywords);
        }
    }

    async screenshot(keywords: string) {
        let date = new Date()
        var time = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        var fileName = keywords.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        await fs.ensureDir('./screenshots');
        await this.page.screenshot({ path: `./screenshots/${time}_${fileName}.png`, fullPage: true });
    }

}