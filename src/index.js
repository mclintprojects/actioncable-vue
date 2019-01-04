import Cable from './cable';

const ActionCableVue = {
	install(Vue, options) {
		new Cable(Vue, options);
	}
};

export default ActionCableVue;
