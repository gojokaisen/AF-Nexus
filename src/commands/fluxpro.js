import fs from 'fs'
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);
export default {
  config: {
    name: "fluxpro",
    aliases: ["fxpro"],
    author: "aki",
    cooldown: 0,
    permission: 0,
    description: "generate cool images",
    usage: "prefix fxpro",
    category: "image"
  },

  onStart: async ({ message, args, api, nexusMessage }) => {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠ Please provide a prompt to create an image. Try something vivid or descriptive!", message.threadID);
    }

    const startTime = Date.now();
    api.sendMessage("🎨 Crafting your image masterpiece... This may take a few moments!", message.threadID, message.messageID);

    try {
      const apiUrl = `https://mahi-apis.onrender.com/api/fluxpro?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      const imageUrl = response.data.imageUrl;
      if (!imageUrl) {
        return api.sendMessage("❌ Sorry, the image couldn’t be retrieved at this time. Please try again later.", message.threadID);
      }

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath);

      const imagePath = path.join(cacheFolderPath, `generated_image_${Date.now()}.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
      const stream = fs.createReadStream(imagePath);

      nexusMessage.reply({
        body: `✨ Your image is ready! Based on your prompt:\n*${prompt}*\n\n🕒 Generated in ${generationTime} seconds.`,
        attachment: stream
      });

    } catch (error) {
      console.error("Image Generation Error:", error);
      return api.sendMessage("❌ An error occurred while creating your image. Please try a different prompt or try again later.", message.threadID);
    }
  }
};