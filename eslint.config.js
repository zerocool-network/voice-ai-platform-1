import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Audio: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-console': 'off',
        },
    },
    {
        ignores: ['public/build/**', 'vendor/**', 'node_modules/**', 'storage/**'],
    },
];
