export type ChannelOptions<V> = {
  [key: string]: {
    connected: () => void;
    rejected: () => void;
    received: (data: {}) => void;
    disconnected: () => void;
  };
};
