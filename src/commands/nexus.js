import axios from 'axios';

const conversationHistory = {};

export default {
  config: {
    name: "nexus",
    version: "1.0",
    author: "hmm",
    permission: 0,
    description: "Unleash the power of your savage AI for unparalleled interactions.",
    category: "ai",
    usage: "{p}go [your prompt here]"
  },
  onStart: async ({ api, message, args, nexusMessage, replyManager }) => {
    const { threadID, messageID, senderID } = message;
    if (args[0] && args[0].toLowerCase() === 'clear') {
      conversationHistory[senderID] = undefined;
      return nexusMessage.reply('Chat history cleared!');
    }
    if (!args.length || (args.length === 0)) {
      return nexusMessage.reply("Yo, wassup!");
    }
    const prompt = args.join(' ');
    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(prompt)}&uid=${senderID}`);
      const content = response.data.response;
      const responseMessage = await api.sendMessage(content, threadID, messageID);
      if (!conversationHistory[senderID]) {
        conversationHistory[senderID] = {
          threadID,
          messageID: responseMessage.messageID,
        };
      }
      const conversationFunction = async (reply) => {
        if (reply.body) {
          try {
            const followUpQuery = encodeURIComponent(reply.body);
            const followUpResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${followUpQuery}&uid=${senderID}`);
            const followUpResponseMessage = followUpResponse.data.response;
            const newResponseMessage = await api.sendMessage(followUpResponseMessage, conversationHistory[senderID].threadID, reply.messageID);
            conversationHistory[senderID].messageID = newResponseMessage.messageID;
            replyManager.registerReplyListener(newResponseMessage.messageID, conversationFunction);
          } catch (error) {
            console.error(error);
            await api.sendMessage(`⚠️ Damn error : ${error.message}`, conversationHistory[senderID].threadID, reply.messageID);
          }
        }
      };
      replyManager.registerReplyListener(responseMessage.messageID, conversationFunction);
    } catch (err) {
      console.error(err);
      await api.sendMessage(`💥 Whoops! Something went wrong: ${err.message}`, threadID, messageID);
    }
  },
  onReply: async ({ api, message, nexusMessage }) => {
    const { threadID, messageID, senderID, body } = message;
    if (!body) {
      return nexusMessage.reply("🌀 Still waiting... Type something, superstar!");
    }
    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(body)}&uid=${senderID}`);
      const content = response.data.response;
      nexusMessage.reply("🔥 On it! Let me blow your mind.");
      nexusMessage.reply(content);
    } catch (err) {
      console.error(err);
      nexusMessage.reply(`⚠️ Error! Seems like something exploded: ${err.message}`);
    }
  }
};