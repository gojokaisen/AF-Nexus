import axios from 'axios';

export default {
  config: {
    name: 'gemi',
    description: 'Chat with AI assistant',
    usage: '(prefix)ai <query>',
    permission: 0,
    category: 'ai',
    author: "Frank X Asta"
  },
  onStart: async ({ api, message, args, nexusMessage }) => {
    if (!args.length) {
      return nexusMessage.reply('Please provide a query');
    }

    const query = args.join(" ");
    const senderID = message.senderID;

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(query)}&uid=${senderID}`);
      const aiResponse = response.data.response;

      let lastMessage;

      async function sendMessage(msg) {
        const reply = await nexusMessage.replyWithCallback(msg, async (response) => {
          lastMessage = response;
        });
      }

      await sendMessage(aiResponse);

      while (true) {
        if (!lastMessage) break;

        const followUpQuery = encodeURIComponent(lastMessage.body);
        const followUpResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${followUpQuery}&uid=${senderID}`);
        const followUpResponseMessage = followUpResponse.data.response;

        await sendMessage(followUpResponseMessage);
      }
    } catch (error) {
      nexusMessage.reply(`Error: ${error.message}`);
    }
  }
};