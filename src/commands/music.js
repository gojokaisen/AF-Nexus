import yts from 'yt-search';
import axios from 'axios';

export default {
  config: {
    name: "music",
    description: "Get music from YouTube",
    usage: "[music name]",
    permission: 0,
    author: "Nexus"
  },
  Nexus: async ({ api, message, args, config, nexusMessage, onReply, sendMessage }) => {
    const query = args.join(" ");
    if (!query) return nexusMessage.reply("❌ Please enter a music name!");

    try {
      const findingMessage = await nexusMessage.reply("🔍 | Finding \"" + query + "\". Please wait...");
      const searchResults = await yts(query);
      if (!searchResults.videos.length) return nexusMessage.reply("❌ | No results found for \"" + query + "\".");

      const topVideo = searchResults.videos[0];
      const videoURL = topVideo.url;
      const downloadBaseURL = "https://ytb-team-calyx-pxdf.onrender.com";
      const downloadURL = downloadBaseURL + "/download?url=" + encodeURIComponent(videoURL) + "&type=mp3";

      const { data: downloadData } = await axios.get(downloadURL);
      if (!downloadData.download_url) throw new Error("Error getting download URL");

      const fileName = downloadData.download_url.split("/").pop();
      const filePath = path.join(tmpDir, fileName);
      const fileDownloadURL = downloadBaseURL + "/" + downloadData.download_url;

      await downloadFile(fileDownloadURL, filePath);
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        fs.unlinkSync(filePath);
        return nexusMessage.reply("❌ | The file size exceeds the 25MB limit. Unable to send \"" + topVideo.title + "\".");
      }

      await nexusMessage.reply({
        body: "🎵 Here is your music based on your search \"" + query + "\"\n\nTitle: " + topVideo.title + "\nYouTube Link: " + videoURL,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      await onReply(findingMessage.messageID);
    } catch (error) {
      console.error("Full error:", error);
      await nexusMessage.reply("❌ | An error occurred: " + error.message);
    }
  }
};