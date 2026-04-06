var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'on-first-retry'
    },
    webServer: [
        {
            command: '"C:\\Program Files\\nodejs\\npm.cmd" run dev:api',
            port: 3001,
            reuseExistingServer: !process.env.CI,
            timeout: 120000
        },
        {
            command: '"C:\\Program Files\\nodejs\\npm.cmd" run dev -- --host 127.0.0.1 --port 4173',
            port: 4173,
            reuseExistingServer: !process.env.CI,
            timeout: 120000
        }
    ],
    projects: [
        {
            name: 'desktop-chromium',
            use: __assign({}, devices['Desktop Chrome'])
        },
        {
            name: 'mobile-chromium',
            use: __assign({}, devices['Pixel 7'])
        }
    ]
});
