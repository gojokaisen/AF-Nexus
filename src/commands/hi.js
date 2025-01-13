export default {
  config: {
    name: 'hi',
    aliases: ['yo', 'wassup'],
    description: 'Say hi to the bot',
    usage: 'hi',
    cooldown: 10,
    permissions: ['user', 'admin']
  },
  onChat: async ({ api, message, config }) => {
    api.sendMessage("Hi! How are you?", message.threadID, message.messageID);
}
  }
