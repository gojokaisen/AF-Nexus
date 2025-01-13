export default {
  config: {
    name: 'unsend',
    description: 'Unsends a bot message when replied to',
    usage: 'Reply to a bot message with (prefix)unsend',
category: "system",
    permission: 0,
    author: "Frank kaumba x Asta"
  },

  Nexus: async ({ api, message, args, config, nexusMessage, onReply, sendMessage }) => {
    try {
      const { messageReply, senderID } = message;
      
      if (!messageReply) {
        return nexusMessage.reply("Please reply to a message you want to unsend.");
      }

      const botID = api.getCurrentUserID();
      
      if (messageReply.senderID !== botID) {
        return nexusMessage.reply("I can only unsend my own messages.");
      }

      await api.unsendMessage(messageReply.messageID);
      
    } catch (error) {
      return nexusMessage.reply("Failed to unsend message: " + error.message);
    }
  }
};