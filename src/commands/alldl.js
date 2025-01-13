import axios from 'axios';
import fs from 'fs';
import getFBInfo from "@xaviabot/fb-downloader";

export default {
  config: {
    name: "adown",
    version: "1.0",
    author: "Jonell Magallanes",
    permission: 0,
    description: "Automatically download TikTok, Facebook, and Capcut videos",
    category: "Media",
    usage: ""
  },

  onStart: async ({ api, message }) => {
    api.sendMessage("😎| This command automatically downloads TikTok, Facebook, and Capcut videos", message.threadID);
  },

  onChat: async ({ api, message }) => {
    const { body, threadID, messageID } = message;
    if (!body || !message.isGroup) return;

    const line = "━━━━━━━━━━━━━━━━━";
    const tiktokRegex = /https:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.*$/;
    const fbRegex = /https:\/\/(www\.)?facebook\.com\/.*$/;
    const capcutRegex = /https:\/\/(www\.)?capcut\.com\/t\/.*$/;

    if (tiktokRegex.test(body)) {
      api.setMessageReaction("📥", messageID, () => {}, true);
      try {
        const response = await axios.post('https://www.tikwm.com/api/', { url: body });
        const { data } = response.data;
        const videoStream = await axios({
          method: 'get',
          url: data.play,
          responseType: 'stream'
        }).then(res => res.data);

        const fileName = `TikTok-${Date.now()}.mp4`;
        const filePath = `./${fileName}`;
        const videoFile = fs.createWriteStream(filePath);

        videoStream.pipe(videoFile);

        videoFile.on('finish', () => {
          videoFile.close(() => {
            api.sendMessage({
              body: `𝗧𝗶𝗸𝘁𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}\nContent: ${data.title}\nLikes: ${data.digg_count}\nComments: ${data.comment_count}`,
              attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath));
          });
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (fbRegex.test(body)) {
      api.setMessageReaction("📥", messageID, () => {}, true);
      try {
        const result = await getFBInfo(body);
        const fbvid = './video.mp4';
        const videoData = await axios.get(encodeURI(result.sd), { responseType: 'arraybuffer' });
        fs.writeFileSync(fbvid, Buffer.from(videoData.data, "utf-8"));

        api.sendMessage({
          body: `𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}`,
          attachment: fs.createReadStream(fbvid)
        }, threadID, () => fs.unlinkSync(fbvid));
      } catch (e) {
        console.error(e);
      }
    }

    if (capcutRegex.test(body)) {
      api.setMessageReaction("📥", messageID, () => {}, true);
      try {
        const response = await axios.get(`https://ccprojectapis.ddns.net/api/capcut?url=${body}`);
        const { result } = response.data;
        const capcutFileName = `Capcut-${Date.now()}.mp4`;
        const capcutFilePath = `./${capcutFileName}`;

        const videoResponse = await axios({
          method: 'get',
          url: result.video_ori,
          responseType: 'arraybuffer'
        });

        fs.writeFileSync(capcutFilePath, Buffer.from(videoResponse.data, 'binary'));

        api.sendMessage({
          body: `𝗖𝗮𝗽𝗰𝘂𝘁 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}\n𝗧𝗶𝘁𝗹𝗲: ${result.title}\n𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${result.description}`,
          attachment: fs.createReadStream(capcutFilePath)
        }, threadID, () => fs.unlinkSync(capcutFilePath));
      } catch (e) {
        console.error(e);
      }
    }
  }
};