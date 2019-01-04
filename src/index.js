import Cable from './cable';

export default class ActionCableVue {
	install(Vue) {
		new Cable(Vue);
	}
}
