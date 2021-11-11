import Vue from "vue";
import { ChannelNameWithParams } from "actioncable";
import { ChannelOptions } from "./options";

declare module "vue/types/vue" {
  export interface Vue {
    $cable: {
      subscribe: (
        subscription: string | ChannelNameWithParams,
        name?: string,
      ) => void;
      perform: (whatToDo: {
        channel: string;
        action: string;
        data: object;
      }) => void;
      unsubscribe: (channelName: string) => void;
      connected: boolean;
      disconnected: boolean;
      connection?: {
        connect: (url?: string | (() => string) | null) => void;
        disconnect: () => void;
      };
    };
  }
}

declare module "vue/types/options" {
  // eslint-disable-next-line no-unused-vars
  export interface ComponentOptions<V extends Vue> {
    channels?: ChannelOptions;
  }
}
