import resolve from 'rollup-plugin-pnp-resolve';
import commonjs from 'rollup-plugin-commonjs';
const { dependencies } = require('./package.json');
const paths = Object.keys(dependencies);
export default [
    {
        input: 'index.js',
        external: Object.keys(paths),
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            paths,
        },
        plugins: [resolve(), commonjs()]
    },
    {
        input: 'ace-editor.js',
        external: Object.values(paths),
        output: {
            paths: { './dist/modules.js': './modules.mjs' },
            file: 'dist/ace-editor.browser.js',
            format: 'esm',
        },
        plugins: [{
            name: 'module',
            resolveId: (importee, importer) => {
                if (!importer) { return };
                // const path = join()
                if (importee === './dist/modules.js') {
                    const id = require.resolve('./modules.mjs');
                    console.log({ importee, importer, id })
                    return id;
                } else {
                    const id = /^\.{0,2}\//.test(importee) ? require.resolve(importee) : paths[importee]
                    console.log({ importee, importer, id })
                    return id;
                }
            }
        }]
    },
    {
        input: 'modules.mjs',
        // external: Object.keys(paths),
        output: {
            file: 'dist/modules.js',
            format: 'esm',
            globals: {
                // 'lit-element': '@polymer/LitElement',
            },
            paths,
        },
        plugins: [
            resolve(),
        ]
    },
]