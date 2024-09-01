import Mixin from "../src/mixin";

describe("Mixin", () => {
  let _addChannel;
  let _removeChannel;
  const userId = 1;

  beforeEach(() => {
    _addChannel = jest.fn();
    _removeChannel = jest.fn();

    global.$options = {
      channels: {
        ChatChannel: {},
        NotificationChannel: {},
        computed: [
          {
            channelName() {
              return `${userId}_channel`;
            },
            connected() {},
            rejected() {},
            disconnected() {},
            received(data) {
              return `${data} was passed in`;
            },
          },
        ],
      },
    };

    global.$cable = {
      _addChannel,
      _removeChannel,
      _unsubscribeOnUnmount: true,
    };
  });

  test("It should not load channels on mount if component does not have channels object defined", () => {
    global.$options = {};
    Mixin.created.call(global);
    expect(_addChannel).toBeCalledTimes(0);
  });

  test("It should correctly unsubscribe from channels on destroy", () => {
    Mixin.beforeUnmount.call(global);
    expect(_removeChannel).toBeCalledTimes(3);
  });

  test("It should not unsubscribe from channels if unsubscribeOnUnmount is not set", () => {
    global.$cable._unsubscribeOnUnmount = false;
    Mixin.beforeUnmount.call(global);
    expect(_removeChannel).toBeCalledTimes(0);
  });

  test("It should not attempt to remove channels on destroy if component does not have channels object defined", () => {
    global.$options = {};
    Mixin.beforeUnmount.call(global);
    expect(_removeChannel).toBeCalledTimes(0);
  });
});
