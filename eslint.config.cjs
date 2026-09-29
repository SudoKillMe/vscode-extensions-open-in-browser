const js = require('@eslint/js');
const stylistic = require('@stylistic/eslint-plugin');
const { defineConfig } = require('eslint/config');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
    { ignores: ['out/**', 'node_modules/**'] },
    {
        files: ['src/**/*.ts'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: globals.node,
            parserOptions: { projectService: true }
        },
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/semi': ['warn', 'always'],
            '@typescript-eslint/naming-convention': ['warn', { selector: 'class', format: ['PascalCase'] }],
            '@typescript-eslint/no-redeclare': 'warn',
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/only-throw-error': 'warn',
            // Existing VS Code command inputs and opn import use these patterns.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            curly: 'warn',
            eqeqeq: 'warn',
            // The server intentionally checks control characters in file paths.
            'no-control-regex': 'off',
            // The ES6 target does not provide Error's cause option.
            'preserve-caught-error': 'off'
        }
    },
    {
        files: ['test/**/*.js', 'eslint.config.cjs'],
        extends: [js.configs.recommended],
        languageOptions: {
            globals: globals.node,
            sourceType: 'commonjs'
        },
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/semi': ['warn', 'always']
        }
    }
]);
