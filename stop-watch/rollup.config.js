import resolve from 'rollup-plugin-pnp-resolve';
import commonjs from 'rollup-plugin-commonjs';

const { dependencies } = require('./package.json');
const replace = o => ({ name: 'replace', resolveId: i => Object.keys(o).includes(i) ? o[i] : i });

export default [{
    input: 'modules.js',
    output: { file: 'dist/modules.js', format: 'esm' },
    plugins: [resolve()]
}, {
    input: 'index.js',
    external: Object.keys(dependencies),
    output: { file: 'dist/cjs.js', format: 'cjs' },
    plugins: [replace({ "./dist/modules.js": "./modules.js" }), resolve(), commonjs()]
}, {
    input: 'index.js',
    external: Object.keys(dependencies),
    output: { file: 'dist/esm.js', format: 'esm' },
    plugins: [replace({ "./dist/modules.js": "./modules.js" }), resolve(), commonjs()]
}]