import axios from 'axios';

export default {
  config: {
    name: 'gem',
    description: 'Chat with AI assistant',
    usage: '(prefix)ai <query>',
    permission: 0,
    author: "Frank X Asta"
  },

  onStart: async ({ api, message, args, nexusMessage }) => {
    if (!args.length) {
      return nexusMessage.reply('Please provide a query');
    }

    const query = args.join(" ");
    const encodedPrompt = encodeURIComponent(query);

    try {
      const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);
      const aiResponse = response.data.answer;

      let currentReply = aiResponse;
      let loop = true;

      while (loop) {
        const reply = await new Promise((resolve) => {
          nexusMessage.replyWithCallback(currentReply, (reply) => {
            resolve(reply);
          });
        });

        if (reply) {
          const followUpQuery = encodeURIComponent(reply.body);
          const followUpResponse = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${followUpQuery}`);
          currentReply = followUpResponse.data.answer;
        } else {
          loop = false;
        }
      }

    } catch (error) {
      nexusMessage.reply(`Error: ${error.message}`);
    }
  }
};