<p align="center">
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://github.com/mclintprojects/actioncable-vue/actions/workflows/test.yml/badge.svg" /></a>
  <img alt="Last Commit" src="https://badgen.net/github/last-commit/mclintprojects/actioncable-vue" />
  <img alt="All Contributors Count" src="https://img.shields.io/github/contributors/mclintprojects/actioncable-vue"/>
  <a href="https://www.npmjs.com/package/actioncable-vue"><img src="https://img.shields.io/npm/v/actioncable-vue.svg"/></a>
  <img alt="Bundle Size" src="https://badgen.net/bundlephobia/minzip/actioncable-vue"/>
  <img alt="Downloads" src="https://img.shields.io/npm/dt/actioncable-vue.svg"/>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/github/stars/mclintprojects/actioncable-vue.svg"/></a>
  <a href="https://github.com/mclintprojects/actioncable-vue/"><img src="https://img.shields.io/npm/l/actioncable-vue.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-3.x-purple.svg"/></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-2.x-purple.svg"/></a>
</p>

<p>ActionCableVue is an easy-to-use Action Cable integration for VueJS.<p>

#### 🚀 Installation

```bash
npm install actioncable-vue --save
```

```javascript
// Vue 3.x
import { createApp } from "vue";
import App from "./App.vue";
import ActionCableVue from "actioncable-vue";

const actionCableVueOptions = {
  debug: true,
  debugLevel: "error",
  connectionUrl: "ws://localhost:5000/api/cable", // If you don"t provide a connectionUrl, ActionCable will use the default behavior
  connectImmediately: true,
  unsubscribeOnUnmount: true,
};

createApp(App)
  .use(store)
  .use(router)
  .use(ActionCableVue, actionCableVueOptions)
  .mount("#app");
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

| **Parameters**       | **Type**        | **Default** | **Required** | **Description**                                                                                                                                  |
| -------------------- | --------------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| debug                | Boolean         | `false`     | Optional     | Enable logging for debug                                                                                                                         |
| debugLevel           | String          | `error`     | Optional     | Debug level required for logging. Either `info`, `error`, or `all`                                                                               |
| connectionUrl        | String/Function | `null`      | Optional     | ActionCable websocket server url. Omit it for the [default behavior](https://guides.rubyonrails.org/action_cable_overview.html#connect-consumer) |
| connectImmediately   | Boolean         | `true`      | Optional     | ActionCable connects to your server immediately. If false, ActionCable connects on the first subscription.                                       |
| unsubscribeOnUnmount | Boolean         | `true`      | Optional     | Unsubscribe from channels when component is unmounted.                                                                                           |
| store                | Object          | null        | Optional     | Vuex store                                                                                                                                       |

#### Table of content

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

#### 🌈 Component Level Usage

If you want to listen to channel events from your Vue component:

1. If you're using **Vue 3** `setup` script define a `channels` object in the `setup` function.
2. If you're using **Vue 3** `defineComponent` define a `channels` property.
3. You need to either add a `channels` object in the Vue component **(Vue 2 only)**
4. If you're using `vue-class-component` define a `channels` property. **(Vue 2 only)**

Each defined object in `channels` will start to receive events provided you subscribe correctly.

##### 1. Vue 3 `setup` script

```typescript
<script setup>
import { onMounted, onUnmounted } from "vue";

const channels = {
  ChatChannel: {
    connected() {
      console.log("connected");
    },
  },
};

onMounted(() => {
  this.$cable.registerChannels(channels);
  this.$cable.subscribe({
    channel: "ChatChannel",
  });
});

onUnmounted(() => {
  this.$cable.unregisterChannels(channels);
  this.$cable.unsubscribe("ChatChannel");
});
</script>
```

##### 2. Vue 3 `defineComponent`

```typescript
import { onMounted } from "vue";

export default defineComponent({
  channels: {
    ChatChannel: {
      connected() {
        console.log("connected");
      },
      rejected() {
        console.log("rejected");
      },
      received(data) {},
      disconnected() {},
    },
  },
  setup() {
    onMounted(() => {
      this.$cable.subscribe({
        channel: "ChatChannel",
      });
    });
  },
});
```

##### 3. Vue 2.x.

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

##### 4. Vue 2.x `vue-class-component`

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

#### 👂🏾 Subscriptions

###### 1. Subscribing to a channel

Define a `channels` object in your component matching the action cable server channel name you passed for the subscription.

```typescript
<script setup>
import { onMounted } from "vue";

const channels = {
  ChatChannel: {
    connected() {
      console.log("connected");
    },
  },
};

onMounted(() => {
  this.$cable.registerChannels(channels);
  this.$cable.subscribe({
    channel: "ChatChannel",
  });
});
</script>
```

### Important ⚠️

> ActionCableVue **automatically** uses your ActionCable server channel name if you do not pass in a specific channel name to use in your `channels`. It will also **override** clashing channel names.

###### 2. Subscribing to the same channel but different rooms

```typescript
<script setup>
import { onMounted } from "vue";

const channels = {
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
};

onMounted(() => {
  this.$cable.registerChannels(channels);

  this.$cable.subscribe(
    {
      channel: "ChatChannel",
      room: "public"
    },
    "chat_channel_public"
  );

  this.$cable.subscribe(
    {
      channel: "ChatChannel",
      room: "private"
    },
    "chat_channel_private"
  );
});
</script>
```

###### 3. Subscribing to a channel with a computed name

```typescript
// Conversations.vue

<script setup>
import { onMounted } from "vue";
const router = useRouter();

const openConversation = (conversationId) => {
  router.push({name: "conversation", params: {id: conversationId});
}
</script>
```

```typescript
// Chat.vue

<script setup>
import { onMounted } from "vue";
const route = useRoute();

const channels = {
  computed: [
    {
      channelName() {
        return `chat-convo-${route.params.conversationId}`;
      },
      connected() {
        console.log("I am connected to a channel with a computed name.");
      },
      rejected() {},
      received(data) {},
      disconnected() {},
    },
  ],
}

onMounted(() => {
  this.$cable.registerChannels(channels);
  this.$cable.subscribe({
    channel: `chat-convo-${route.params.conversationId}`,
  });
});
</script>
```

#### 🔇 Unsubscriptions

> For Vue 2.x and when using Vue 3.x `defineComponent`, when your component is **destroyed** ActionCableVue **automatically unsubscribes** from any channel **that component** was subscribed to.

###### 1. Unsubscribing from a channel (Vue 3.x setup script)

```typescript
<script setup>
import {onUnmounted } from "vue";
onUnmounted(() => {
  this.$cable.unsubscribe("ChatChannel");
});
</script>
```

###### 2. Unsubscribing from a channel Vue 2.x

```javascript
new Vue({
  methods: {
    unsubscribe() {
      this.$cable.unsubscribe("ChatChannel");
    },
  },
});
```

#### 🔌 Manually connect to the server

ActionCableVue automatically connects to your Action Cable server if `connectImmediately` is not set to `false` during setup. If you do set `connectImmediately` to `false` you can manually trigger a connection to your ActionCable server with `this.$cable.connection.connect`.

```typescript
<script setup>
const connectWithRefreshedToken = (token) => {
  this.$cable.connection.connect(`ws://localhost:5000/api/cable?token=${token}`);
}
</script>
```

#### ✂️ Disconnecting from the server

```typescript
<script setup>
const disconnect = () => {
  this.$cable.connection.disconnect();
}
</script>
```

#### 💎 Performing an action on your Action Cable server

Requires that you have a method defined in your Rails Action Cable channel whose name matches the action property passed in.

```typescript
<script setup>
import { onMounted } from "vue";

const sendMessage = () => {
  this.$cable.perform({
    channel: "ChatChannel",
    action: "send_message",
    data: {
      content: "Hi",
    },
  });
};

const channels = {
  ChatChannel: {
    connected() {
      console.log("Connected to the chat channel");
    },
    received(data) {
      console.log("Message received");
    },
  },
};

onMounted(() => {
  this.$cable.registerChannels(channels);
  this.$cable.subscribe({
    channel: "ChatChannel",
  });
});
</script>
```

#### 🐬 Usage with Vuex (Vue 2.x)

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

#### 💪 Usage with Nuxt

ActionCableVue works just fine with Nuxt 2 or 3. All you need to do is set it up as a client side plugin.

##### Nuxt 3

```javascript
// /plugins/actioncablevue.client.js
import ActionCableVue from "actioncable-vue";

export default defineNuxtPlugin(({ vueApp }) => {
  const config = useRuntimeConfig();

  vueApp.use(ActionCableVue, {
    debug: true,
    debugLevel: "all",
    connectionUrl: config.public.WEBSOCKET_HOST,
    connectImmediately: true,
  });
});


// /pages/chat.vue
<script setup>
const { vueApp } = useNuxtApp();

let $cable;
const channels = {
  ChatChannel: {
    connected() {
      console.log("connected");
    },
  }
};

onMounted(() => {
  $cable = vueApp.config.globalProperties.$cable;

  $cable.registerChannels(channels, vueApp);
  $cable.subscribe({
    channel: "ChatChannel",
  });
});

onUnmounted(() => {
  $cable.unregisterChannels(channels, vueApp);
  $cable.unsubscribe("ChatChannel");
});
</script>
```

##### Nuxt 2

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

// nuxt.config.js
plugins: [{ src: "@/plugins/actioncable-vue", ssr: false }];
```
