import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: 'list',
    use: {
        baseURL: `http://127.0.0.1:${port}/react-redux-store/`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'desktop',
            use: {
                browserName: 'chromium',
                viewport: { width: 1440, height: 1000 },
            },
        },
        {
            name: 'tablet',
            use: {
                browserName: 'chromium',
                viewport: { width: 768, height: 1024 },
            },
        },
        {
            name: 'mobile',
            use: {
                browserName: 'chromium',
                viewport: { width: 375, height: 812 },
                isMobile: true,
                hasTouch: true,
            },
        },
    ],
    webServer: {
        command: `npm run build && npm run preview -- --port ${port} --strictPort`,
        url: `http://127.0.0.1:${port}/react-redux-store/`,
        reuseExistingServer: false,
    },
});
