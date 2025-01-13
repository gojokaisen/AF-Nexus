import axios from 'axios';
import fs from 'fs';

export default {
 config: {
 name: "xl31",
 author: "ArYAN",
 cooldown: 0,
 permission: 0,
 description: "mage generator",
 usage: "{p}xl31 <prompt> [--ar=<aspect_ratio>] or [--ar <aspect_ratio>]"
 },

 onStart: async ({ message, args, api, nexusMessage }) => {
 try {
 const input = args.join(" ");
 const arMatch = input.match(/--ar[=\s]?([\d:]+)/);
 const prompt = arMatch ? input.replace(arMatch[0], "").trim() : input;
 const ar = arMatch ? arMatch[1] : "1:1";

 if (!prompt) {
 return nexusMessage.reply("Please provide some prompts.");
 }

 if (ar && !/^\d+:\d+$/.test(ar)) {
 return message.reply("Invalid aspect ratio format. Use --ar=<width>:<height> or --ar <width>:<height> (e.g., --ar=2:3 or --ar 2:3).");
 }

 api.setMessageReaction("⏰", message.messageID, () => {}, true);

 const baseURL = `https://aryanchauhanapi2.onrender.com/api/animagen31`;
 const params = { prompt, ar }; 

 const response = await axios.get(baseURL, {
 params: params,
 responseType: 'stream'
 });

 api.setMessageReaction("✅", message.messageID, () => {}, true);

 const fileName = 'xl31.png';
 const filePath = `/tmp/${fileName}`;
 const writerStream = fs.createWriteStream(filePath);

 response.data.pipe(writerStream);

 writerStream.on('finish', function() {
 nexusMessage.reply({
 body: "",
 attachment: fs.createReadStream(filePath)
 });
 });

 writerStream.on('error', function(err) {
 console.error('Error writing file:', err);
 nexusMessage.reply("❌ Failed to process the file.");
 });

 } catch (error) {
 console.error('Error generating image:', error);
 nexusMessage.reply("❌ Failed to generate the image.");
 }
 }
};