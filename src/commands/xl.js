import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  config: {
    name: "xl",
    aliases: ["sdxl"],
    author: "Team Calyx | Frank * Asta",
    cooldowns: 10,
    permission: 0,
    description: "Generate an image from text using SDXL",
    category: "image",
    usage: "{pn} prompt [--ar=<ratio>] or [==ar <ratio>]",
  },

  onStart: async ({ message, args, api }) => {
    const promptText = args.join(" ");
    
    if (!promptText) {
      return api.sendMessage(`😖 Please enter a text prompt\nExample:\n${global.config.prefix}xl a cat\n${global.config.prefix}xl a girl --ar 2:3`, message.threadID);
    }

    let ratio = '1:1';
    const ratioIndex = args.findIndex(arg => arg.startsWith('--ar='));
    
    if (ratioIndex !== -1) {
      ratio = args[ratioIndex].split('=')[1];
      args.splice(ratioIndex, 1);
    } else {
      const ratioFlagIndex = args.findIndex(arg => arg === '--ar');
      if (ratioFlagIndex !== -1 && args[ratioFlagIndex + 1]) {
        ratio = args[ratioFlagIndex + 1];
        args.splice(ratioFlagIndex, 2);
      }
    }

    api.sendMessage("⌛ Generating your image...", message.threadID, message.messageID);
    const startTime = new Date().getTime();

    try {
      const prompt = args.join(' ');
      const world = `&ratio=${ratio}`;
      const team = `xl31?prompt=${encodeURIComponent(prompt)}${world}`;
      const o = "xyz";
      const imageURL = `https://smfahim.${o}/${team}`;

      const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
      
      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath);
      }
      
      const imagePath = path.join(cachePath, `${Date.now()}_xl.png`);
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

      const timeTaken = ((new Date().getTime() - startTime) / 1000).toFixed(2);
      
      const stream = fs.createReadStream(imagePath);
      await api.sendMessage({
        body: `🎨 Here is your SDXL image\n⏱️ Generated in: ${timeTaken}s`,
        attachment: stream
      }, message.threadID, () => {
        fs.unlinkSync(imagePath);
      });

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ Failed to generate image. Please try again later.", message.threadID);
    }
  }
};