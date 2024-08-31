import Cable from "../src/cable";
import { createApp } from "vue";

describe("Cable", () => {
  let Vue;
  const IS_VUE_3 = Number(process.env.VUE_VER) === 3;

  if (IS_VUE_3) {
    Vue = createApp({});
    global._version = 3;
  } else {
    Vue = require("vue");
  }

  let cable, create;
  global.window = {};

  beforeEach(() => {
    if (!IS_VUE_3) {
      Vue.version = "2.6.11";
      Vue.prototype = {};
      global._version = 2;
    }

    Vue.mixin = jest.fn();
    create = jest.fn();

    cable = new Cable(Vue, { connectionUrl: "ws://localhost:5000/api/cable" });

    global._cable = {
      subscriptions: {
        create,
      },
    };
    global._channels = {
      subscriptions: {},
    };
    global._logger = { log() { } };
    global._contexts = {};
    global._removeChannel = function (name) {
      cable._removeChannel.call(global, name);
    };
    global._addContext = function (context) {
      cable._addContext.call(global, context);
    };
    global._connect = jest.fn();
    global.subscribe = jest.fn();
  });

  test("It should initialize correctly if options provided", () => {
    const store = {};

    cable = new Cable(Vue, {
      connectionUrl: "ws://localhost:5000/api/cable",
      debug: true,
      debugLevel: "error",
      store,
    });
    IS_VUE_3
      ? expect(Vue.config.globalProperties.$cable._cable).toBeDefined()
      : expect(Vue.prototype.$cable._cable).toBeDefined();
    expect(Vue.mixin).toHaveBeenCalled();
    expect(cable._logger._debug).toBe(true);
    expect(cable._logger._debugLevel).toBe("error");
    expect(cable.connection).toBeDefined();
    expect(store.$cable).toBeDefined();
  });

  test("It should initialize correctly if options not provided", () => {
    cable = new Cable(Vue);

    IS_VUE_3
      ? expect(Vue.config.globalProperties.$cable._cable).toBeDefined()
      : expect(Vue.prototype.$cable._cable).toBeDefined();
    expect(Vue.mixin).toHaveBeenCalled();
    expect(cable._logger._debug).toBe(false);
    expect(cable._logger._debugLevel).toBe("error");
    expect(cable.connection).toBeDefined();
  });

  test("It should not connect immediately if connectImmediately is false", () => {
    cable = new Cable(Vue, {
      connectionUrl: "ws://localhost:5000/api/cable",
      debug: true,
      debugLevel: "error",
      connectImmediately: false,
    });

    IS_VUE_3
      ? expect(Vue.config.globalProperties.$cable._cable).toBeNull()
      : expect(Vue.prototype.$cable._cable).toBeNull();
  });

  test("It should connect on first subscription if connectImmediately is false", () => {
    cable = new Cable(Vue, {
      connectionUrl: "ws://localhost:5000/api/cable",
      debug: true,
      debugLevel: "error",
      connectImmediately: false,
    });

    IS_VUE_3
      ? expect(Vue.config.globalProperties.$cable._cable).toBeNull()
      : expect(Vue.prototype.$cable._cable).toBeNull();

    create.mockReturnValue({});
    global._cable = null;

    cable.subscribe.call(global, { channel: "ChatChannel" });
    expect(global._connect).toHaveBeenCalled();
    expect(global.subscribe).toHaveBeenCalled();
  });

  test("It should correctly subscribe to channel", () => {
    create.mockReturnValue({});
    cable.subscribe.call(global, { channel: "ChatChannel" });
    expect(global._cable.subscriptions.create).toBeCalled();
    expect(global._channels.subscriptions.ChatChannel).toBeDefined();
  });

  test("It should correctly subscribe to channel with custom name", () => {
    create.mockReturnValue({});
    cable.subscribe.call(
      global,
      { channel: "ChatChannel" },
      "custom_channel_name",
    );
    expect(global._cable.subscriptions.create).toBeCalled();
    expect(global._channels.subscriptions.custom_channel_name).toBeDefined();
  });

  test("It should correctly subscribe to same channel with multiple custom names", () => {
    create.mockReturnValue({});
    cable.subscribe.call(
      global,
      { channel: "ChatChannel" },
      "custom_channel_name",
    );
    cable.subscribe.call(
      global,
      { channel: "ChatChannel" },
      "custom_channel_name_2",
    );

    expect(global._cable.subscriptions.create).toBeCalledTimes(2);
    expect(global._channels.subscriptions.custom_channel_name).toBeDefined();
    expect(global._channels.subscriptions.custom_channel_name_2).toBeDefined();
  });

  test("It should correctly perform an action on a channel", () => {
    const perform = jest.fn();
    const whatToDo = {
      channel: "ChatChannel",
      action: "send_message",
      data: { content: "Hi" },
    };
    global._channels.subscriptions.ChatChannel = {
      perform,
    };

    cable.perform.call(global, whatToDo);
    expect(perform).toHaveBeenCalledWith(whatToDo.action, whatToDo.data);
  });

  test("It should not perform an action if subscription to channel does not exist", () => {
    const whatToDo = {
      channel: "ChatChannel",
      action: "send_message",
      data: { content: "Hi" },
    };

    const t = () => {
      cable.perform.call(global, whatToDo);
    };
    expect(t).toThrowError();
  });

  test("It should correctly fire connected event", () => {
    const connected = jest.fn();
    global._channels.ChatChannel = [
      { _uid: 0, name: "ChatChannel", connected },
      { _uid: 1, name: "ChatChannel", connected },
    ];
    global._contexts[0] = { context: this };
    global._contexts[1] = { context: this };

    cable._fireChannelEvent.call(
      global,
      "ChatChannel",
      cable._channelConnected,
    );

    expect(connected).toBeCalledTimes(2);
  });

  test("It should correctly fire rejected event", () => {
    const rejected = jest.fn();
    global._channels.ChatChannel = [{ _uid: 1, name: "ChatChannel", rejected }];
    global._contexts[1] = { context: this };

    cable._fireChannelEvent.call(
      global,
      "ChatChannel",
      cable._subscriptionRejected,
    );

    expect(rejected).toBeCalledTimes(1);
  });

  test("It should correctly fire disconnected event", () => {
    const disconnected = jest.fn();
    global._channels.ChatChannel = [
      {
        _uid: 2,
        name: "ChatChannel",
        disconnected,
      },
    ];
    global._contexts[2] = { context: this };

    cable._fireChannelEvent.call(
      global,
      "ChatChannel",
      cable._channelDisconnected,
    );

    expect(disconnected).toBeCalledTimes(1);
  });

  test("It should correctly fire received event", () => {
    const received = jest.fn();
    const data = { age: 1 };
    global._channels.ChatChannel = [{ _uid: 3, name: "ChatChannel", received }];
    global._contexts[3] = { context: this };

    cable._fireChannelEvent.call(
      global,
      "ChatChannel",
      cable._channelReceived,
      data,
    );

    expect(received).toBeCalledTimes(1);
    expect(received).toHaveBeenCalledWith(data);
  });

  test("It should correctly unsubscribe from channel", () => {
    const unsubscribe = jest.fn();
    const channelName = "ChatChannel";
    const channelUid = 3;

    global._channels.ChatChannel = {
      _uid: channelUid,
      name: channelName,
    };
    global._channels.subscriptions[channelName] = { unsubscribe };
    global._contexts[channelUid] = { users: 1 };

    cable.unsubscribe.call(global, channelName);
    expect(global._channels[channelName]).toBeDefined();
    expect(global._channels.subscriptions[channelName]).toBeDefined();
    expect(global._contexts[channelUid]).toBeDefined();
    expect(unsubscribe).toBeCalledTimes(1);
  });

  test("It should remove destroyed component's channel correctly", () => {
    const unsubscribe = jest.fn();
    const channelName = "ChatChannel";
    const channelUid = 3;

    global._channels.ChatChannel = [
      {
        _uid: channelUid,
        name: channelName,
      },
    ];
    global._channels.subscriptions[channelName] = { unsubscribe };
    global._contexts[channelUid] = { users: 1 };

    cable._removeChannel.call(global, channelName, channelUid);
    expect(global._channels[channelName].length).toBe(0);
    expect(global._channels.subscriptions[channelName]).toBeUndefined();
    expect(global._contexts[channelUid]).toBeUndefined();
    expect(unsubscribe).toBeCalledTimes(1);
  });

  test("It should correctly add context", () => {
    const uid = 1;
    const context = IS_VUE_3 ? { $: { uid } } : { _uid: uid };
    cable._addContext.call(global, context);
    expect(global._contexts[uid]).toBeDefined();

    cable._addContext.call(global, context);
  });

  test("It should correctly add channels", () => {
    const channelName = "ChatChannel";
    const uid = 1;
    const context = IS_VUE_3 ? { $: { uid } } : { _uid: uid };

    cable._addChannel.call(global, channelName, {}, context);
    expect(global._channels[channelName]).toBeDefined();
    expect(global._channels[channelName][0]._uid).toEqual(uid);
    expect(global._channels[channelName].length).toEqual(1);
    expect(global._channels[channelName][0]._name).toEqual(channelName);
    expect(global._contexts[uid]).toBeDefined();
  });
});
