import { PluginFunction } from "vue";
// augment typings of Vue.js
import "./vue";

export interface ActionCableVueOptions {
  debug?: boolean;
  debugLevel?: string;
  connectionUrl: () => string | string;
  connectImmediately?: boolean;
  store?: object;
}

declare class VueActionCableExt {
  static install: PluginFunction<ActionCableVueOptions>;
  static defaults: ActionCableVueOptions;
}

export default VueActionCableExt;
