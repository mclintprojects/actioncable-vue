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
  export interface ComponentOptions {
    channels?: ChannelOptions;
  }
}
