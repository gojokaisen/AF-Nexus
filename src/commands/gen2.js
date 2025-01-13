import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

export default {
  config: {
    name: "gen2",
    aliases: [],
    author: "ASTA x frank | API fahim",
    cooldowns: 5,
    permission: 0,
    description: "Generate an image based on a prompt.",
    category: "image",
    usage: "{pn} <prompt>"
  },
  onStart: async ({ message, args, api }) =>  {
    const prompt = args.join(" ");
    
    if (!prompt) {
      return api.sendMessage("👀 Please provide a prompt.", message.threadID);
    }

    api.sendMessage("⏳ Generating your imagination....", message.threadID, message.messageID);

    try {
      const domain = '.xyz';
      const imageURL = `https://smfahim${domain}/creartai?prompt=${encodeURIComponent(prompt)}`;

      const imageResponse = await axios.get(imageURL, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      api.sendMessage({
        body: "",
        attachment: stream
      }, message.threadID, () => {
        fs.unlinkSync(imagePath);
      });
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | An error occurred. Please try again later.", message.threadID, message.messageID);
    }
  }
}