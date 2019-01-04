<p align="center">
  <a href="https://www.npmjs.com/package/actioncable-vue"><img src="https://img.shields.io/npm/v/actioncable-vue.svg"/> <img src="https://img.shields.io/npm/dt/actioncable-vue.svg"/></a>
  <a href="https://github.com/vuejs/awesome-vue"><img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-2.x-brightgreen.svg"/></a>
  <a href="http://packagequality.com/#?package=actioncable-vue"><img src="http://npm.packagequality.com/shield/actioncable-vue.svg"/></a>
  <a href="https://github.com/MetinSeylan/Vue-Socket.io/"><img src="https://img.shields.io/npm/l/actioncable-vue.svg"/></a>
  <a href="https://github.com/MetinSeylan/Vue-Socket.io/"><img src="https://img.shields.io/github/stars/MetinSeylan/Vue-Socket.io.svg"/></a>
</p>

<p>ActionCableVue is an easy-to-use Action Cable integration for VueJS.<p>

#### 🚀 Installation

```bash
npm install actioncable-vue --save
```

```javascript
import Vue from 'vue';
import App from './App.vue';
import ActionCableVue from 'actioncable-vue';

Vue.use(ActionCableVue, {
	debug: true,
	debugLevel: 'error',
	connection: 'ws://localhost:5000/api/cable'
});

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
```

| **Parameters** | **Type** | **Default** | **Required** | **Description**          |
| -------------- | -------- | ----------- | ------------ | ------------------------ |
| debug          | Boolean  | `false`     | Optional     | Enable logging for debug |
| connection     | String   | `null`      | Required     | Websocket server url     |

#### 🌈 Component Level Usage

<p>If you want to listen socket events from component side, you need to add `sockets` object in Vue component, and every function will start to listen events, depends on object key</p>

```javascript
new Vue({
	channels: {
		ChatChannel: {
			connected() {},
			rejected() {},
			received(data) {},
			disconnected() {}
		}
	},
	methods: {
		clickButton: function(data) {
			// $socket is socket.io-client instance
			this.$socket.emit('emit_method', data);
		}
	},
	mounted() {
		this.$cable.subscribe({ channel: ChatChannel, room: 'public' });
	}
});
```
