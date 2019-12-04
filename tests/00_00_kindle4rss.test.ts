import { BrowserHelper } from '../utilities/BrowserHelper';

let helper: BrowserHelper;

beforeEach(async () => {
    helper = new BrowserHelper();
    await helper.init();
}, 30 * 1000);

test('send to kindle', async () => {

    var email = process.argv.find(p => p.indexOf('email') > 0).split('=')[1];
    var password = process.argv.find(p => p.indexOf('password') > 0).split('=')[1];
    var topic =process.argv.find(p=>p.indexOf('topic')>0).split('=')[1];
    await helper.goto('https://kindle4rss.com/');
    await helper.clickByText('Sign in with email');
    await helper.type('#field-email_address', email);
    await helper.type('#field-password', password);
    await helper.click('input.submit-button');
    await helper.waitFor(3);
    await helper.waitForText('Logout');

    await helper.clickByText(topic);
    await helper.clickByText('Send to Kindle');
    await helper.waitFor(5);

}, 3 * 60 * 1000);

afterEach(async () => {
    await helper.close();
});



