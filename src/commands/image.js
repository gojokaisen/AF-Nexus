import axios from 'axios';

export default {
  config: {
    name: 'image',
    version: '1.0',
    author: 'Ayanfe',
    permission: 0,
    description: 'Fetch a random image from Unsplash API.',
    category: "image",
    usage: 'prefix image'
  },
  onStart: async ({ nexusMessage, api, args, event, message }) => {
    const text = args.join(' ');
    if (!text) {
      return nexusMessage.reply("Please provide a keyword to search for a random image.");
    }
    const searchQuery = text.trim();
    const accessKey = "R6_-bAjOS06I89QrCoZ4zgVLEoLjjA3MdltvKuf2uD0";
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&client_id=${accessKey}&count=1`;
    api.setMessageReaction("⏳", message.messageID, () => {}, true);
    try {
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
        const image = response.data[0];
        const imageUrl = image.urls.regular;
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        nexusMessage.reply({ body: `Here is your random image for "${searchQuery}"`, attachment: imageResponse.data });
      } else {
        nexusMessage.reply("No images found ");
      }
    } catch (error) {
      console.error(error);
      nexusMessage.reply("An error occurred while fetching the image. Please try again later.");
    }
    api.setMessageReaction("", message.messageID, () => {}, true);
  }
};