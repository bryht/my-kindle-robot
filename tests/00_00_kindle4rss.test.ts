import { BrowserHelper } from '../utilities/BrowserHelper';

let helper: BrowserHelper;

beforeEach(async () => {
    helper = new BrowserHelper();
    await helper.init();
});

test('send to kindle', async () => {

    await helper.goto('https://kindle4rss.com/');
    await helper.clickByText('Sign in with email');
    await helper.type('#field-email_address','{email}');
    await helper.type('#field-password','{password}');
    await helper.click('input.submit-button');
    await helper.waitFor(3);
    await helper.waitForText('Logout');

    await helper.clickByText('{topic}');
    await helper.clickByText('Send to Kindle');

}, 3 * 60 * 1000);

afterEach(async () => {
    await helper.close();
});



