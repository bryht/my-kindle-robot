module.exports = {
    maxConcurrency: 1,
    testSequencer: './jest.sequencer.js',
    globals: {
        logSteps: true,
        browser: {
            headless: false,
            devtools: true,
            timeout: 0//here close timeout to have time to check issues
        }
    }
};