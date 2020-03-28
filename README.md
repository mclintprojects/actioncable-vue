<p align="center">
  <a href="https://travis-ci.org/mclintprojects/actioncable-vue"><img src="https://travis-ci.org/mclintprojects/actioncable-vue.svg?branch=master" /></a>
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
import ActionCableVue from 'actioncable-vue';
import App from './App.vue';
import store from './store';

Vue.use(ActionCableVue, {
  debug: true,
  debugLevel: 'error',
  connectionUrl: 'ws://localhost:5000/api/cable',
  connectImmediately: true,
  jwt: function() { return store.getters.user.token; }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
```

| **Parameters**     | **Type** | **Default** | **Required** | **Description**                                                                                            |
| ------------------ | -------- | ----------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| debug              | Boolean  | `false`     | Optional     | Enable logging for debug                                                                                   |
| debugLevel         | String   | `error`     | Optional     | Debug level required for logging. Either `info`, `error`, or `all`                                         |
| connectionUrl      | String   | `null`      | Required     | ActionCable websocket server url                                                                           |
| connectImmediately | Boolean  | `true`      | Optional     | ActionCable connects to your server immediately. If false, ActionCable connects on the first subscription. |
| jwt | Function | `null`| Optional | JWT token for authorization on your ActionCable server |

#### 🌈 Component Level Usage

<p>If you want to listen channel events from your Vue component, you need to add a `channels` object in the Vue component. Each defined object in `channels` will start to receive events provided you subscribe correctly.</p>

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
      this.$cable.perform({
        channel: 'ChatChannel',
        action: 'send_message',
        data: {
          content: this.message
        }
      });
    }
  },
  mounted() {
    this.$cable.subscribe({
      channel: 'ChatChannel',
      room: 'public'
    });
  }
});
```

#### ✨ Subscriptions

###### 1. Subscribing to a channel

Requires that you have an object defined in your component's `channels` object matching the action cable server channel name you passed for the subscription.

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
    this.$cable.subscribe({
      channel: 'ChatChannel'
    });
  }
});
```

##### Important

> ActionCableVue **automatically** uses your ActionCable server channel name if you do not pass in a specific channel name to use in your `channels`. It will also **override** clashing channel names.

###### 2. Subscribing to the same channel but different rooms

```javascript
new Vue({
  channels: {
    chat_channel_public: {
      connected() {
        console.log('I am connected to the public chat channel.');
      }
    },
    chat_channel_private: {
      connected() {
        console.log('I am connected to the private chat channel.');
      }
    }
  },
  mounted() {
    this.$cable.subscribe({
        channel: 'ChatChannel',
        room: 'public'
      },
      'chat_channel_public'
    );
    this.$cable.subscribe({
        channel: 'ChatChannel',
        room: 'private'
      },
      'chat_channel_private'
    );
  }
});
```

###### 3. Subscribing to a channel with a computed name

```javascript
// Conversations.vue

new Vue({
  methods: {
    openConversation(conversationId){
      this.$router.push({name: 'conversation', params: {id: conversationId});
    }
  }
});
```

```javascript
// Chat.vue

new Vue({
  channels: {
    computed: [{
      channelName() {
        return `${this.$route.params.conversationId}`;
      },
      connected() {
        console.log('I am connected to a channel with a computed name.');
      },
      rejected() {},
      received(data) {},
      disconnected() {}
    }]
  },
  mounted() {
    this.$cable.subscribe({
      channel: this.$route.params.conversationId
    });
  }
});
```

#### 🎃 Unsubscriptions

> When your component is **destroyed** ActionCableVue **automatically unsubscribes** from any channel **that component** was subscribed to.

```javascript
new Vue({
  methods: {
    unsubscribe() {
      this.$cable.unsubscribe('ChatChannel');
    }
  },
  mounted() {
    this.$cable.subscribe({
      channel: 'ChatChannel'
    });
  }
});
```

#### ♣ Performing an action on your Action Cable server

Requires that you have a method defined in your Rails Action Cable channel whose name matches the action property passed in.

```javascript
new Vue({
  channels: {
    ChatChannel: {
      connected() {
        console.log('Connected to the chat channel');
      },
      received(data) {
        console.log('Message received');
      }
    }
  },
  methods: {
    sendMessage() {
      this.$cable.perform({
        channel: 'ChatChannel',
        action: 'send_message',
        data: {
          content: 'Hi'
        }
      });
    }
  },
  mounted() {
    this.$cable.subscribe({
      channel: 'ChatChannel'
    });
  }
});
```

#### 💪 Usage with Nuxt.JS

ActionCableVue works just fine with Nuxt.JS. All you need to do is set it up as a client side plugin.

```javascript
// /plugins/actioncable-vue.js

import Vue from 'vue';
import ActionCableVue from 'actioncable-vue';

if (process.client) {
  Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: 'all',
    connectionUrl: process.env.WEBSOCKET_HOST,
    connectImmediately: true
  });
}
```

Don't forget to register your plugin.

```javascript
// nuxt.config.js
/*
 ** Plugins to load before mounting the App
 */
plugins: [{ src: '@/plugins/actioncable-vue', ssr: false }];
```
