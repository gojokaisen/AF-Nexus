import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

export default {
  config: {
    name: "pin",
    description: "📸 Search and download Pinterest images",
    usage: "pin <search term> -<number>",
    category: "media",
    permission: 0,
    cooldown: 5
  },

  run: async ({ api, message, args }) => {
    try {
      const query = args.join(" ");

      if (!query.includes("-")) {
        return api.sendMessage(
          `⚠️ 𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐟𝐨𝐫𝐦𝐚𝐭!\n\n𝐔𝐬𝐞: pin <search> -<number>\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: pin cute cats -5`,
          message.threadID,
          message.messageID
        );
      }

      const loadingMsg = await api.sendMessage(
        "🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚒𝚖𝚊𝚐𝚎𝚜...", 
        message.threadID, 
        message.messageID
      );

      const searchTerm = query.substring(0, query.indexOf('-')).trim();
      const numberSearch = parseInt(query.split("-").pop().trim()) || 6;

      if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 10) {
        return api.sendMessage(
          "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐨𝐨𝐬𝐞 1-10 𝐢𝐦𝐚𝐠𝐞𝐬",
          message.threadID,
          message.messageID
        );
      }

      const apiUrl = `https://ccprojectapis.ddns.net/api/pin?title=${searchTerm}&count=${numberSearch}`;
      const response = await axios.get(apiUrl);
      const images = response.data.data;

      if (!images || images.length === 0) {
        return api.sendMessage(
          `❌ 𝐍𝐨 𝐢𝐦𝐚𝐠𝐞𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 "${searchTerm}"`,
          message.threadID,
          message.messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const attachments = [];
      for (let i = 0; i < Math.min(numberSearch, images.length); i++) {
        const imgResponse = await axios.get(images[i], { responseType: "arraybuffer" });
        const imgPath = path.join(cacheDir, `pin_${i + 1}.jpg`);
        fs.writeFileSync(imgPath, imgResponse.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage(
        {
          body: `╭─❍ 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 𝐑𝐄𝐒𝐔𝐋𝐓𝐒 ❍─╮\n\n📍 𝐒𝐞𝐚𝐫𝐜𝐡: ${searchTerm}\n📸 𝐈𝐦𝐚𝐠𝐞𝐬: ${numberSearch}\n\n╰──────────⟡`,
          attachment: attachments
        },
        message.threadID,
        message.messageID
      );

      api.unsendMessage(loadingMsg.messageID);

      // Cleanup cache
      for (const file of fs.readdirSync(cacheDir)) {
        fs.unlinkSync(path.join(cacheDir, file));
      }
      fs.rmdirSync(cacheDir);

    } catch (error) {
      console.error("Pinterest Error:", error);
      return api.sendMessage(
        "❌ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚒𝚖𝚊𝚐𝚎𝚜! 𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛.",
        message.threadID,
        message.messageID
      );
    }
  }
};