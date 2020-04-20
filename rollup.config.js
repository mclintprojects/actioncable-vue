import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  dest: 'actioncablevue.js',
  format: 'umd',
  plugins: [resolve(), commonjs({
    namedExports: {
      "node_modules/@rails/actioncable/app/assets/javascripts/action_cable.js": ["createConsumer"]
    }
  })]
};