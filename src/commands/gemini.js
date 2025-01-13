import axios from 'axios';

const apiUrl = 'https://Mahi-apis.onrender.com/api/promot';

export default {
  config: {
    name: "gemini",
    aliases: [],
    version: "1.0",
    author: "Mahi--",
    countDown: 10,
    permission: 0,
    description: "Generate a creative AI response from text or image",
    category: "ai",
    usage: "/xlp (reply to an image)\n/xlp [text prompt]"
  },

  onStart: async ({ api, args, message, nexusMessage}) => {
    try {
      api.setMessageReaction("🕦", message.messageID, () => {}, true);

      let imageUrl = null;
      let promptText = null;

      if (message.type === "message_reply" && message.messageReply && message.messageReply.attachments && message.messageReply.attachments.length > 0) {
        if (["photo", "sticker"].includes(message.messageReply.attachments[0].type)) {
          imageUrl = message.messageReply.attachments[0].url;
        }
      } else if (args[0]) {
        promptText = args.join(" ");
      }

      const requestData = {
        promptText: promptText || "",
        imageURLs: imageUrl ? [imageUrl] : [],
      };

      const response = await axios.post(apiUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.result) {
        const result = response.data.result;
        nexusMessage.reply(result);
        api.setMessageReaction("✅", message.messageID, () => {}, true);
      } else {
        nexusMessage.reply("Failed to generate a prompt. Please try again later.");
        api.setMessageReaction("❌", message.messageID, () => {}, true);
      }

    } catch (error) {
      console.error("Error in /xlp command:", error);
      nexusMessage.reply("There was an error processing your request.");
 api.setMessageReaction("❌", message.messageID, () => {}, true);
    }
  },
};