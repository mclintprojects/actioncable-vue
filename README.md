<p align="center">
  <a href="https://travis-ci.org/mclintprojects/actioncable-vue"><img src="https://travis-ci.org/mclintprojects/actioncable-vue.svg?branch=master" /></a>
  <img alt="Last Commit" src="https://badgen.net/github/last-commit/mclintprojects/actioncable-vue" />
  <img alt="All Contributors Count" src="https://img.shields.io/github/contributors/mclintprojects/actioncable-vue"/>
  <a href="https://www.npmjs.com/package/actioncable-vue"><img src="https://img.shields.io/npm/v/actioncable-vue.svg"/></a>
  <img alt="Bundle Size" src="https://badgen.net/bundlephobia/minzip/actioncable-vue"/>
  <img alt="Downloads" src="https://img.shields.io/npm/dt/actioncable-vue.svg"/>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/github/stars/mclintprojects/actioncable-vue.svg"/></a>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/npm/l/actioncable-vue.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-2.x-purple.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-3.x-purple.svg"/></a>
</p>

<p>ActionCableVue is an easy-to-use Action Cable integration for VueJS.<p>

#### 🚀 Installation

```bash
npm install actioncable-vue --save
```

```javascript
// Vue 2.x
import Vue from "vue";
import ActionCableVue from "actioncable-vue";
import App from "./App.vue";

Vue.use(ActionCableVue, {
  debug: true,
  debugLevel: "error",
  connectionUrl: "ws://localhost:5000/api/cable", // or function which returns a string with your JWT appended to your server URL as a query parameter
  connectImmediately: true,
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
```

```javascript
// Vue 3.x
import { createApp } from "vue";
import App from "./App.vue";
import ActionCableVue from "actioncable-vue";

const actionCableVueOptions = {
  debug: true,
  debugLevel: "error",
  connectionUrl: "ws://localhost:5000/api/cable",
  connectImmediately: true,
};

createApp(App)
  .use(store)
  .use(router)
  .use(ActionCableVue, actionCableVueOptions)
  .mount("#app");
```

| **Parameters**     | **Type**        | **Default** | **Required** | **Description**                                                                                                                                  |
| ------------------ | --------------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| debug              | Boolean         | `false`     | Optional     | Enable logging for debug                                                                                                                         |
| debugLevel         | String          | `error`     | Optional     | Debug level required for logging. Either `info`, `error`, or `all`                                                                               |
| connectionUrl      | String/Function | `null`      | Optional     | ActionCable websocket server url. Omit it for the [default behavior](https://guides.rubyonrails.org/action_cable_overview.html#connect-consumer) |
| connectImmediately | Boolean         | `true`      | Optional     | ActionCable connects to your server immediately. If false, ActionCable connects on the first subscription.                                       |
| store              | Object          | null        | Optional     | Vuex store                                                                                                                                       |

#### Table of content

- [Support ActionCable-Vue](https://github.com/mclintprojects/actioncable-vue#-support-actioncable-vue)
- [Component Level Usage](https://github.com/mclintprojects/actioncable-vue#-component-level-usage)
- [Subscriptions](https://github.com/mclintprojects/actioncable-vue#-subscriptions)
- [Unsubscriptions](https://github.com/mclintprojects/actioncable-vue#-unsubscriptions)
- [Manually connect to the server](https://github.com/mclintprojects/actioncable-vue#-manually-connect-to-the-server)
- [Disconnecting from the server](https://github.com/mclintprojects/actioncable-vue#-disconnecting-from-the-server)
- [Performing an action on your Action Cable server](https://github.com/mclintprojects/actioncable-vue#-performing-an-action-on-your-action-cable-server)
- [Usage with Vuex](https://github.com/mclintprojects/actioncable-vue#-usage-with-vuex)
- [Usage with Nuxt.JS](https://github.com/mclintprojects/actioncable-vue#-usage-with-nuxtjs)

#### Wall of Appreciation

- Many thanks to [@x88BitRain](https://github.com/x8BitRain) for adding Vue 3 compatibility

#### ☕ Support ActionCable-Vue

If you'd like to donate to support the continued development and maintenance of actioncable-vue, you can do so [here.](https://sendcash.africa/#/send/NG/2001944264/50211)

#### 🌈 Component Level Usage

If you want to listen to channel events from your Vue component, you need to either add a `channels` object in the Vue component, or if you're using `vue-class-component` define a `channels` property. Each defined object in `channels` will start to receive events provided you subscribe correctly.

```javascript
new Vue({
  data() {
    return {
      message: "Hello world",
    };
  },
  channels: {
    ChatChannel: {
      connected() {},
      rejected() {},
      received(data) {},
      disconnected() {},
    },
  },
  methods: {
    sendMessage: function () {
      this.$cable.perform({
        channel: "ChatChannel",
        action: "send_message",
        data: {
          content: this.message,
        },
      });
    },
  },
  mounted() {
    this.$cable.subscribe({
      channel: "ChatChannel",
      room: "public",
    });
  },
});
```

Alternative definition for `vue-class-component` users.

```typescript
@Component
export default class ChatComponent extends Vue {
  @Prop({ required: true }) private id!: string;

  get channels() {
    return {
      ChatChannel: {
        connected() {
          console.log("connected");
        },
        rejected() {},
        received(data) {},
        disconnected() {},
      },
    };
  }

  sendMessage() {
    this.$cable.perform({
      channel: "ChatChannel",
      action: "send_message",
      data: {
        content: this.message,
      },
    });
  }

  async mounted() {
    this.$cable.subscribe({
      channel: "ChatChannel",
      room: "public",
    });
  }
}
```

#### ✨ Subscriptions

###### 1. Subscribing to a channel

Define a `channels` object in your component matching the action cable server channel name you passed for the subscription.

```javascript
new Vue({
  channels: {
    ChatChannel: {
      connected() {
        console.log("I am connected.");
      },
    },
  },
  mounted() {
    this.$cable.subscribe({
      channel: "ChatChannel",
    });
  },
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
        console.log("I am connected to the public chat channel.");
      },
    },
    chat_channel_private: {
      connected() {
        console.log("I am connected to the private chat channel.");
      },
    },
  },
  mounted() {
    this.$cable.subscribe(
      {
        channel: "ChatChannel",
        room: "public",
      },
      "chat_channel_public",
    );
    this.$cable.subscribe(
      {
        channel: "ChatChannel",
        room: "private",
      },
      "chat_channel_private",
    );
  },
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
    computed: [
      {
        channelName() {
          return `${this.$route.params.conversationId}`;
        },
        connected() {
          console.log("I am connected to a channel with a computed name.");
        },
        rejected() {},
        received(data) {},
        disconnected() {},
      },
    ],
  },
  mounted() {
    this.$cable.subscribe({
      channel: this.$route.params.conversationId,
    });
  },
});
```

#### 🎃 Unsubscriptions

> When your component is **destroyed** ActionCableVue **automatically unsubscribes** from any channel **that component** was subscribed to.

```javascript
new Vue({
  methods: {
    unsubscribe() {
      this.$cable.unsubscribe("ChatChannel");
    },
  },
  mounted() {
    this.$cable.subscribe({
      channel: "ChatChannel",
    });
  },
});
```

#### 👺 Manually connect to the server

ActionCableVue automatically connects to your Action Cable server if `connectImmediately` is not set to `false` during setup. If you do set `connectImmediately` to `false` you can manually trigger a connection to your ActionCable server with `this.$cable.connection.connect`.

```javascript
new Vue({
  methods: {
    connectWithRefreshedToken(token) {
      // You can optionally pass in a connection URL string
      // You can optionally pass in a function that returns a connection URL
      // You can choose not to pass in anything and it'll reconnect with the connection URL provided during setup.
      this.$cable.connection.connect(
        `ws://localhost:5000/api/cable?token=${token}`,
      );
    },
  },
});
```

#### 👽 Disconnecting from the server

```javascript
new Vue({
  methods: {
    disconnect() {
      this.$cable.connection.disconnect();
    },
  },
});
```

#### 💎 Performing an action on your Action Cable server

Requires that you have a method defined in your Rails Action Cable channel whose name matches the action property passed in.

```javascript
new Vue({
  channels: {
    ChatChannel: {
      connected() {
        console.log("Connected to the chat channel");
      },
      received(data) {
        console.log("Message received");
      },
    },
  },
  methods: {
    sendMessage() {
      this.$cable.perform({
        channel: "ChatChannel",
        action: "send_message",
        data: {
          content: "Hi",
        },
      });
    },
  },
  mounted() {
    this.$cable.subscribe({
      channel: "ChatChannel",
    });
  },
});
```

#### 🐬 Usage with Vuex

ActionCableVue has support for Vuex. All you have to do is setup your store correctly and pass it in during the ActionCableVue plugin setup.

```javascript
// store.js

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {
    sendMessage(state, content) {
      this.$cable.perform({
        action: "send_message",
        data: {
          content,
        },
      });
    },
  },
  actions: {
    sendMessage({ commit }, content) {
      commit("sendMessage", content);
    },
  },
});
```

```javascript
import store from "./store";
import Vue from "vue";
import ActionCableVue from "actioncable-vue";

Vue.use(ActionCableVue, {
  debug: true,
  debugLevel: "all",
  connectionUrl: process.env.WEBSOCKET_HOST,
  connectImmediately: true,
  store,
});
```

#### 💪 Usage with Nuxt.JS

ActionCableVue works just fine with Nuxt.JS. All you need to do is set it up as a client side plugin.

```javascript
// /plugins/actioncable-vue.js

import Vue from "vue";
import ActionCableVue from "actioncable-vue";

if (process.client) {
  Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: "all",
    connectionUrl: process.env.WEBSOCKET_HOST,
    connectImmediately: true,
  });
}
```

Don't forget to register your plugin.

```javascript
// nuxt.config.js
/*
 ** Plugins to load before mounting the App
 */
plugins: [{ src: "@/plugins/actioncable-vue", ssr: false }];
```
