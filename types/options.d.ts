export type ChannelOptions = {
  [key: string]: {
    connected: () => void;
    rejected: () => void;
    received: (data: {}) => void;
    disconnected: () => void;
  };
};
