const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    presets: ['typescript', 'react'],
    addons: config => ({
        eslint: {
            rules: {
                'no-alert': 'off',
                'no-unused-expressions': 'off',
                'no-param-reassign': 'off',
                'no-await-in-loop': 'off',
                'no-restricted-syntax': 'off',
                'no-use-before-define': 'off', // using ts rule instead
                'no-continue': 'off',
                'no-plusplus': 'off',
                'no-bitwise': 'off',
                'no-debugger': 'warn',
                'import/order': 'warn',
                'import/prefer-default-export': 'off',
                'react/destructuring-assignment': 'off',
                'react/no-array-index-key': 'off',
                'jsx-a11y/click-events-have-key-events': 'off',
                'jsx-a11y/interactive-supports-focus': 'off',
                '@typescript-eslint/ban-ts-ignore': 'off',
                '@typescript-eslint/no-namespace': 'off',
            },
        },
        babel: {
            presets: (presets = []) => [...presets, '@emotion/babel-preset-css-prop'],
            plugins: (plugins = []) => {
                plugins.push('@babel/plugin-proposal-optional-chaining');
                plugins.push('@babel/plugin-proposal-nullish-coalescing-operator');

                if (config.options.devMode) {
                    plugins.push('react-refresh/babel');
                }
                return plugins;
            },
        },
        typescript: {
            compilerOptions: {
                skipLibCheck: true,
                downlevelIteration: true,
            },
        },
    }),
    runners: config => ({
        webpack: {
            resolve: {
                alias: {
                    'react-dom': 'react-dom',
                },
            },
            optimization: {
                minimizer: [
                    new TerserPlugin({
                        extractComments: false,
                        terserOptions: { keep_fnames: true },
                    }),
                ],
            },
            plugins: (plugins = []) => {
                if (config.options.devMode) {
                    plugins.push(new ReactRefreshPlugin({ disableRefreshCheck: true }));
                }
                return plugins;
            },
        },
    }),
};
