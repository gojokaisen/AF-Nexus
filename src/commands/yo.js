export default {
  config: {
    name: 'yo',
    description: 'Say hello to the bot',
    usage: '!hello',
    cooldown: 10,
    permissions: ['user', 'admin']
  },
  run: async ({ api, message, args, config, setReplyContext }) => {
    api.sendMessage("Hello there! How can I assist you?", message.threadID, { messageID: message.messageID });
    setReplyContext({ reply: 'initial' });
  },
  onReply: async ({ api, message, config, replyData }) => {
    if (replyData.reply === 'initial') {
      api.sendMessage("I can help you with a variety of tasks! What do you need help with?", message.threadID, { messageID: message.messageID });
    }
  }
}