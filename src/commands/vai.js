import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);
export default { 
  config: { 
    name: 'vai', 
    aliases: ['cdi'], 
    author: 'UPoL 🐔', 
    permission: 0, 
    description:  'Ask a question to GPT and get a voice response using Google TTS',
    category: 'ai', 
    usage:"{pn} <question>" 
  }, 
  onStart: async ({ api, message, args, nexusMessage }) => {
    const input = args.join(' '); 
    if (!input) {
      return nexusMessage.reply('Enter a question'); 
    }
    await nexusMessage.reply('Please wait....⏳');
    try { 
      const res = await axios.get(`https://upol-piu.onrender.com/gemini?prompt=${encodeURIComponent(input)}`);
      const answer = res.data.answer; 
      const msg = `${answer}`;
      const languageCode = 'en'; 
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodeURIComponent(answer)}`;
      const response = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
      const audioFilePath = path.join(__dirname, `response_${message.senderID}.mp3`);
      fs.writeFileSync(audioFilePath, response.data);
      api.sendMessage({ 
        body: msg, 
        attachment: fs.createReadStream(audioFilePath) 
      }, message.threadID, () => {
        fs.unlinkSync(audioFilePath);
      });
    } catch (error) { 
      nexusMessage.reply(`Error: ${error.message}`); 
    }
  }
};