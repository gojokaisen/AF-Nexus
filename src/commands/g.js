export default {
  config: {
    name: 'g',
    description: 'Replies with a hello message',
    permission: 0,
  },

  run: async ({ api, message, args, config }) => {
    return 'Hello!';
  },
};