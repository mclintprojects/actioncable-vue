export const createActionCablePlugin = (store, cable) => {
  store.prototype.$cable = cable;
};
