import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  config: {
    name: 'ytb',
    description: 'Search and download YouTube video or audio by keyword',
    usage: '(prefix)ytb -v <keyword> or (prefix)ytb -a <keyword>',
    permission: 0,
    author: "Frank X Asta"
  },

  onStart: async ({ api, message, args, nexusMessage }) => {
    const videoIndex = args.indexOf('-v');
    const audioIndex = args.indexOf('-a');

    if (videoIndex === -1 && audioIndex === -1) {
      return nexusMessage.reply('Please provide either -v for video or -a for audio along with the keyword');
    }

    const keywordIndex = (videoIndex !== -1) ? videoIndex + 1 : audioIndex + 1;
    const type = (videoIndex !== -1) ? 'video' : 'audio';

    if (args.length < keywordIndex + 1) {
      return nexusMessage.reply(`Please provide a keyword for ${type}`);
    }

    const keyword = args.slice(keywordIndex).join(" ");
    const apiKey = 'gifted';
    const searchApiUrl = `https://api.giftedtech.my.id/api/search/youtube?apikey=${apiKey}&q=${encodeURIComponent(keyword)}`;

    try {
      const searchResponse = await axios.get(searchApiUrl);
      const videoUrl = searchResponse.data.results[0]?.url;

      if (!videoUrl) {
        return nexusMessage.reply(`No results found for keyword: ${keyword}`);
      }

      const downloadApiUrl = `https://api.giftedtech.my.id/api/download/ytdl2?apikey=${apiKey}&url=${videoUrl}`;
      const response = await axios.get(downloadApiUrl, { responseType: 'stream' });

      const fileExtension = (type === 'video') ? 'mp4' : 'mp3';
      const filePath = path.join(__dirname, `${path.basename(videoUrl)}.${fileExtension}`);
      const writeStream = fs.createWriteStream(filePath);
      response.data.pipe(writeStream);

      writeStream.on('finish', async () => {
        await nexusMessage.reply({ attachment: fs.createReadStream(filePath) });

        fs.unlink(filePath, (err) => {
          if (err) {
            nexusMessage.reply(`Error deleting file: ${err.message}`);
          }
        });
      });

    } catch (error) {
      nexusMessage.reply(`Error: ${error.message}`);
    }
  }
};