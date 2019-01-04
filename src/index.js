import Cable from './cable';

export default (ActionCableVue = {
	install(Vue) {
		new Cable(Vue);
	}
});
