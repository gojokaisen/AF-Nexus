import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

export default {
  config: {
    name: 'lyrics',
    description: '🎵 Get lyrics for your favorite songs',
    usage: '!lyrics songname - artist',
    permission: 0,
    category: 'music'
  },

  run: async ({ api, message, args }) => {
    const text = args.join(" ");
    
    if (!text) {
      return api.sendMessage('✨ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎', message.threadID, message.messageID);
    }

    let songName, artistName;
    if (text.includes("-")) {
      [songName, artistName] = text.split("-").map(item => item.trim());
    } else {
      songName = text;
      artistName = "";
    }

    api.sendMessage('🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚏𝚘𝚛 𝚕𝚢𝚛𝚒𝚌𝚜...', message.threadID, message.messageID);

    try {
      const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(songName)}`);
      
      if (response.data && response.data.lyrics) {
        let formattedLyrics = `🎵 𝐒𝐨𝐧𝐠: ${songName}\n`;
        if (artistName) {
          formattedLyrics += `👤 𝐀𝐫𝐭𝐢𝐬𝐭: ${artistName}\n`;
        }
        formattedLyrics += `\n━━━━━━━━━━━━━━━━\n\n`;
        formattedLyrics += response.data.lyrics.trim();
        formattedLyrics += `\n\n━━━━━━━━━━━━━━━━\n`;
        formattedLyrics += `💫 𝙴𝚗𝚓𝚘𝚢 𝚝𝚑𝚎 𝚖𝚞𝚜𝚒𝚌!`;

        const chunks = formattedLyrics.match(/([\s\S]{1,1999})/g);
        
        if (!chunks || chunks.length === 1) {
          api.sendMessage(formattedLyrics, message.threadID, message.messageID);
        } else {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const partText = `\n(𝙿𝚊𝚛𝚝 ${i + 1}/${chunks.length})`;
            
            api.sendMessage(chunk + partText, message.threadID);
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      } else {
        api.sendMessage('❌ 𝙽𝚘 𝚕𝚢𝚛𝚒𝚌𝚜 𝚏𝚘𝚞𝚗𝚍!', message.threadID, message.messageID);
      }
    } catch (error) {
      let errorMessage = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚕𝚢𝚛𝚒𝚌𝚜!';
      if (error.response && error.response.status === 404) {
        errorMessage = `❌ 𝙽𝚘 𝚕𝚢𝚛𝚒𝚌𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 "${songName}"`;
        if (artistName) {
          errorMessage += ` 𝚋𝚢 ${artistName}`;
        }
      }
      api.sendMessage(errorMessage, message.threadID, message.messageID);
    }
  }
};