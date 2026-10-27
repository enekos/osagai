import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default defineConfig(
	{ ignores: ['dist/', '.svelte-kit/', 'node_modules/'] },

	js.configs.recommended,
	ts.configs.strictTypeChecked,
	ts.configs.stylisticTypeChecked,
	svelte.configs.recommended,

	{
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				projectService: { allowDefaultProject: ['*.js', '*.ts'] },
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},
		linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' }
	},

	{
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: ts.parser, svelteConfig } }
	},

	{
		files: ['**/*.svelte.ts'],
		languageOptions: { parser: ts.parser }
	},

	{
		rules: {
			eqeqeq: ['error', 'always'],
			curly: ['error', 'multi-line', 'consistent'],
			'no-console': 'error',
			'no-alert': 'error',
			'no-var': 'error',
			'prefer-const': 'off',
			'svelte/prefer-const': ['error', { destructuring: 'all' }],
			'prefer-template': 'error',
			'prefer-arrow-callback': 'error',
			'object-shorthand': ['error', 'always'],
			'no-implicit-coercion': ['error', { allow: ['!!', '+'] }],
			'no-useless-rename': 'error',
			'no-useless-concat': 'error',
			'no-useless-computed-key': 'error',
			'no-lonely-if': 'error',
			'no-else-return': ['error', { allowElseIf: false }],
			'no-unneeded-ternary': 'error',
			'no-param-reassign': 'error',
			'no-return-assign': ['error', 'except-parens'],
			'no-sequences': 'error',
			'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
			'prefer-object-has-own': 'error',
			'prefer-exponentiation-operator': 'error',
			'prefer-regex-literals': 'error',
			'func-style': ['error', 'declaration', { allowArrowFunctions: true }],

			'@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			'@typescript-eslint/consistent-type-exports': 'error',
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/only-throw-error': 'error',
			'@typescript-eslint/switch-exhaustiveness-check': 'error',
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all' }],
			'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { boolean: true } }],
			'@typescript-eslint/prefer-promise-reject-errors': ['error', { allowThrowingUnknown: true }],
			'@typescript-eslint/no-deprecated': ['error', { allow: [{ from: 'lib', name: 'execCommand' }] }],

			'svelte/block-lang': ['error', { script: 'ts', style: [null] }],
			'svelte/button-has-type': 'error',
			'svelte/no-at-html-tags': 'error',
			'svelte/no-target-blank': 'error',
			'svelte/no-useless-mustaches': 'error',
			'svelte/prefer-class-directive': 'error',
			'svelte/prefer-style-directive': 'error',
			'svelte/shorthand-attribute': 'error',
			'svelte/shorthand-directive': 'error',
			'svelte/spaced-html-comment': 'error',
			'svelte/no-reactive-reassign': 'error',
			'svelte/require-store-reactive-access': 'error',
			'svelte/valid-compile': 'error'
		}
	},

	{
		files: ['**/*.svelte'],
		rules: {
			'@typescript-eslint/no-unnecessary-type-arguments': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off'
		}
	},

	{
		files: ['**/*.test.ts', '**/*.test.svelte.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off'
		}
	},

	{
		files: ['*.config.js', '*.config.ts'],
		...ts.configs.disableTypeChecked
	}
);
