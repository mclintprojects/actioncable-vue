<p align="center">
  <a href="https://www.npmjs.com/package/actioncable-vue"><img src="https://img.shields.io/npm/v/actioncable-vue.svg"/> <img src="https://img.shields.io/npm/dt/actioncable-vue.svg"/></a>
  <a href="https://github.com/vuejs/awesome-vue"><img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-2.x-brightgreen.svg"/></a>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/npm/l/actioncable-vue.svg"/></a>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/github/stars/mclintprojects/actioncable-vue.svg"/></a>
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
	connectionUrl: 'ws://localhost:5000/api/cable'
});

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
```

| **Parameters** | **Type** | **Default** | **Required** | **Description**                                                    |
| -------------- | -------- | ----------- | ------------ | ------------------------------------------------------------------ |
| debug          | Boolean  | `false`     | Optional     | Enable logging for debug                                           |
| debugLevel     | String   | `error`     | Optional     | Debug level required for logging. Either `info`, `error`, or `all` |
| connectionUrl  | String   | `null`      | Required     | ActionCable websocket server url                                   |

#### 🌈 Component Level Usage

<p>If you want to listen socket events from component side, you need to add `sockets` object in Vue component, and every function will start to listen events, depends on object key</p>

```javascript
new Vue({
	data() {
		return {
			message: 'Hello world'
		};
	},
	channels: {
		ChatChannel: {
			connected() {},
			rejected() {},
			received(data) {},
			disconnected() {}
		}
	},
	methods: {
		sendMessage: function() {
			this.$cable.perform('ChatChannel', 'send_message', {
				content: this.message
			});
		}
	},
	mounted() {
		this.$cable.subscribe({ channel: 'ChatChannel', room: 'public' });
	}
});
```

#### Subscriptions

###### 1. Subscribing to a channel

Requires that you have an object defined in your `channels` matching the action cable server channel name you passed for the subscription.

```javascript
new Vue({
	channels: {
		ChatChannel: {
			connected() {
				console.log('I am connected.');
			}
		}
	},
	mounted() {
		this.$cable.subscribe({ channel: 'ChatChannel' });
	}
});
```

##### Important

> ActionCableVue automatically uses your ActionCable server channel name if you do not pass in a specific channel name to use in your `channels`. It will also **override** clashing channel names.

###### 2. Subscribing to the same channel but multiple rooms

```javascript
new Vue({
	channels: {
		'chat_channel_public': {
			connected() {
				console.log('I am connected to the public chat channel.');
			}
		},
		'chat_channel_private': {
			connected() {
				console.log('I am connected to the private chat channel.');
			}
		}
	},
	mounted() {
		this.$cable.subscribe({ channel: 'ChatChannel', room: 'public'}, 'chat_channel_public' });
		this.$cable.subscribe({ channel: 'ChatChannel', 'private' }, 'chat_channel_private');
	}
});
```
