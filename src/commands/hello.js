export default {
  config: {
    name: 'hello',
    aliases: ['heyo', 'bro'],
    description: 'Replies with a hello message',
    usage: '(prefix)hello',
    permission: 0,
  },

  run: async ({ api, message, args, config, nexusMessage }) => {
    nexusMessage.reply("hi");
  },
};