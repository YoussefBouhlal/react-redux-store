import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import accessibility from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
    {
        ignores: [
            'node_modules',
            'build',
            'dist',
            'playwright-report',
            'test-results',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    accessibility.flatConfigs.recommended,
    {
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        plugins: { 'react-hooks': hooks },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' },
            ],
        },
    },
);
