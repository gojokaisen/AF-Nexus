import axios from 'axios';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const _filename = fileURLToPath(import.meta.url);

const __dirname = dirname(_filename);
const tmpDir = path.join(__dirname, 'cache');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

async function downloadFile(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

export default {
    config: {
        name: "music",
        description: "Get music from YouTube",
        usage: "(prefix)music [music name]",
        permission: 0,
        category: "fun",
        author: "Frank kaumba x Asta"
    },

    Nexus: async ({ api, message, args, config, nexusMessage }) => {
        const { threadID, messageID } = message;
        const query = args.join(" ");

        if (!query) {
            return nexusMessage.reply(`❌ Please enter a music name!`);
        }

        try {
            const findingMessage = await nexusMessage.reply(`🔍 | Finding "${query}". Please wait...`);

            const searchResults = await yts(query);

            if (!searchResults.videos.length) {
                return nexusMessage.reply(`❌ | No results found for "${query}".`);
            }

            const topVideo = searchResults.videos[0];
            const videoURL = topVideo.url;

            const downloadBaseURL = "https://api.davidcyriltech.my.id/download/ytmp3?url=";
            const downloadURL = `${downloadBaseURL}${encodeURIComponent(videoURL)}`;

            const { data: downloadData } = await axios.get(downloadURL);

            if (!downloadData.download_url) {
                throw new Error("Error getting download URL");
            }

            const fileName = downloadData.download_url.split("/").pop();
            const filePath = path.join(tmpDir, fileName);

            const fileDownloadURL = downloadData.download_url;

            await downloadFile(fileDownloadURL, filePath);

            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 25) {
                fs.unlinkSync(filePath);
                return nexusMessage.reply(`❌ | The file size exceeds the 25MB limit. Unable to send "${topVideo.title}".`);
            }

            await api.sendMessage(
                {
                    body: `🎵 Here is your music based on your search "${query}"\n\nTitle: ${topVideo.title}\nYouTube Link: ${videoURL}`,
                    attachment: fs.createReadStream(filePath)
                },
                threadID,
                () => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            );

            api.unsendMessage(findingMessage.messageID);

        } catch (error) {
            console.error('Full error:', error);
            nexusMessage.reply(`❌ | An error occurred: ${error.message}`);
        }
    }
};