import resolve from 'rollup-plugin-pnp-resolve';
import commonjs from 'rollup-plugin-commonjs';

const { join } = require('path');
const paths = require('./package.json').dependencies;

console.log(Object.values(paths))
function unpkg() {
    return {
        name: 'unpkg',
        resolveId: (importee, importer) => {
            if (!importer) { return };
            // const path = join()
            const id = /^\.{0,2}\//.test(importee) ? require.resolve(importee) : paths[importee]
            console.log({ importee, importer, id })
            return id;
        }
    }
}

export default [
    // {
    //     input: 'index.js',
    //     external: Object.keys(paths),
    //     output: {
    //         file: 'dist/index.js',
    //         format: 'cjs',
    //         paths,
    //     },
    //     plugins: [resolve(), commonjs()]
    // },

    // Outputs modules with unpkg urls
    // {
    //     input: 'index.js',
    //     external: Object.values(paths),
    //     output: {
    //         paths: { './dist/modules.js': './modules.mjs' },
    //         file: 'dist/browser.js',
    //         format: 'esm',
    //     },
    //     plugins: [{
    //         name: 'module',
    //         resolveId: (importee, importer) => {
    //             if (!importer) { return };
    //             // const path = join()
    //             if (importee === './dist/modules.js') {
    //                 const id = require.resolve('./modules.mjs');
    //                 console.log({ importee, importer, id })
    //                 return id;
    //             } else {
    //                 const id = /^\.{0,2}\//.test(importee) ? require.resolve(importee) : paths[importee]
    //                 console.log({ importee, importer, id })
    //                 return id;
    //             }
    //         }
    //     }]
    // },
    // {
    //     input: 'ace-editor.js',
    //     external: Object.values(paths),
    //     output: {
    //         paths: { './dist/modules.js': './modules.mjs' },
    //         file: 'dist/ace-editor.browser.js',
    //         format: 'esm',
    //     },
    //     plugins: [{
    //         name: 'module',
    //         resolveId: (importee, importer) => {
    //             if (!importer) { return };
    //             // const path = join()
    //             if (importee === './dist/modules.js') {
    //                 const id = require.resolve('./modules.mjs');
    //                 console.log({ importee, importer, id })
    //                 return id;
    //             } else {
    //                 const id = /^\.{0,2}\//.test(importee) ? require.resolve(importee) : paths[importee]
    //                 console.log({ importee, importer, id })
    //                 return id;
    //             }
    //         }
    //     }]
    // },

    // All dependencies are bundles into a single file
    // For Dev purposes
    {
        input: 'modules.js',
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