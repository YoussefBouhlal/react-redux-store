import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    base: '/react-redux-store/',
    plugins: [react()],
    resolve: {
        extensions: ['.mjs', '.mts', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    optimizeDeps: { entries: ['index.html'] },
    build: { target: ['es2022', 'chrome109', 'firefox115', 'safari16.4'] },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
});
