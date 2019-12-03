module.exports = {
    maxConcurrency: 1,
    testSequencer: './jest.sequencer.js',
    globals: {
        logSteps: true,
        browser: {
            headless: true,
            devtools: false,
            timeout: 5000//here close timeout to have time to check issues
        }
    }
};