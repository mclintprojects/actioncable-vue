import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/actioncablevue.js',
    format: 'umd',
    name: 'ActionCableVue'
  },
  plugins: [resolve(), commonjs({
    namedExports: {
      "node_modules/@rails/actioncable/app/assets/javascripts/action_cable.js": ["createConsumer"]
    }
  }), terser()]
};