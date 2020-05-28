import * as common from '@pat-tickets/common';

const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => {}) => {
      callback();
    }),
  },
};

export = {
  ...common,
  natsWrapper,
};
